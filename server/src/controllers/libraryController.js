import { Book, BookIssue, StudentProfile } from '../models/index.js';

// GET /api/library/books
export const getBooks = async (req, res, next) => {
  try {
    const { search = '', category = '', status = '', page = 1, limit = 12 } = req.query;

    const query = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { author: regex }, { isbn: regex }, { publisher: regex }];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(query).sort({ title: 1 }).skip(skip).limit(limitNum),
      Book.countDocuments(query),
    ]);

    // Distinct categories for filters
    const categories = await Book.distinct('category');

    res.status(200).json({
      success: true,
      data: books,
      categories,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/library/books/:id
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found in library catalogue' });
    }

    // Include recent borrow history for admin
    let issueHistory = [];
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      issueHistory = await BookIssue.find({ bookId: book._id })
        .populate('studentId', 'fullName registrationNumber')
        .sort({ issueDate: -1 })
        .limit(10);
    }

    res.status(200).json({
      success: true,
      data: book,
      issueHistory,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/library/books
export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      isbn,
      author,
      category,
      publisher,
      edition,
      totalCopies = 1,
      shelfLocation = 'Main Stacks',
      coverImage,
      description,
    } = req.body;

    if (!title || !isbn || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, ISBN, Author, and Category are required.',
      });
    }

    const existing = await Book.findOne({ isbn: isbn.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Book with ISBN ${isbn} already exists in library records.`,
      });
    }

    const copies = parseInt(totalCopies, 10) || 1;

    const newBook = await Book.create({
      title: title.trim(),
      isbn: isbn.trim().toUpperCase(),
      author: author.trim(),
      category: category.trim(),
      publisher: publisher ? publisher.trim() : '',
      edition: edition || '1st Edition',
      totalCopies: copies,
      availableCopies: copies,
      shelfLocation: shelfLocation.trim(),
      coverImage: coverImage || '',
      description: description || '',
      status: copies > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
    });

    res.status(201).json({
      success: true,
      message: 'Book successfully registered to library catalogue',
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/library/books/:id
export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const {
      title,
      isbn,
      author,
      category,
      publisher,
      edition,
      totalCopies,
      shelfLocation,
      coverImage,
      description,
    } = req.body;

    if (isbn && isbn.trim().toUpperCase() !== book.isbn) {
      const clash = await Book.findOne({ isbn: isbn.trim().toUpperCase(), _id: { $ne: book._id } });
      if (clash) {
        return res.status(409).json({ success: false, message: 'ISBN already assigned to another book.' });
      }
      book.isbn = isbn.trim().toUpperCase();
    }

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (category) book.category = category.trim();
    if (publisher !== undefined) book.publisher = publisher.trim();
    if (edition) book.edition = edition;
    if (shelfLocation) book.shelfLocation = shelfLocation.trim();
    if (coverImage !== undefined) book.coverImage = coverImage;
    if (description !== undefined) book.description = description;

    if (totalCopies !== undefined) {
      const newTotal = parseInt(totalCopies, 10);
      const currentlyIssued = book.totalCopies - book.availableCopies;
      if (newTotal < currentlyIssued) {
        return res.status(400).json({
          success: false,
          message: `Cannot set total copies to ${newTotal}. ${currentlyIssued} copies are currently issued to students.`,
        });
      }
      book.totalCopies = newTotal;
      book.availableCopies = newTotal - currentlyIssued;
      book.status = book.availableCopies > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book details updated successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/library/books/:id
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Verify no currently active issues
    const activeIssues = await BookIssue.countDocuments({
      bookId: book._id,
      status: { $in: ['ISSUED', 'OVERDUE'] },
    });

    if (activeIssues > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove book. There are ${activeIssues} active borrows outstanding.`,
      });
    }

    await Book.findByIdAndDelete(book._id);
    await BookIssue.deleteMany({ bookId: book._id });

    res.status(200).json({
      success: true,
      message: 'Book catalogue record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/library/issues
export const getBookIssues = async (req, res, next) => {
  try {
    const query = {};

    // Role Guard: Student sees only their personal issues
    if (req.user.role === 'STUDENT') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (!studentProfile) {
        return res.status(200).json({ success: true, data: [] });
      }
      query.studentId = studentProfile._id;
    } else {
      if (req.query.studentId) query.studentId = req.query.studentId;
      if (req.query.bookId) query.bookId = req.query.bookId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const issues = await BookIssue.find(query)
      .populate('bookId', 'title isbn author category shelfLocation coverImage')
      .populate({
        path: 'studentId',
        select: 'fullName registrationNumber phone currentSemester',
        populate: { path: 'courseId', select: 'name code' },
      })
      .sort({ issueDate: -1 });

    // Auto-check overdue statuses
    const now = new Date();
    const updatedIssues = issues.map((issue) => {
      const obj = issue.toObject();
      if (obj.status === 'ISSUED' && new Date(obj.dueDate) < now) {
        obj.isOverdue = true;
        const daysLate = Math.ceil((now - new Date(obj.dueDate)) / (1000 * 60 * 60 * 24));
        obj.calculatedFine = daysLate * 5; // ₹5 per day late
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      data: updatedIssues,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/library/issues (Issue a book)
export const issueBook = async (req, res, next) => {
  try {
    const { bookId, studentId, dueDate, remarks } = req.body;

    if (!bookId || !studentId) {
      return res.status(400).json({ success: false, message: 'Book and Student are required.' });
    }

    const [book, student] = await Promise.all([
      Book.findById(bookId),
      StudentProfile.findById(studentId),
    ]);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Selected book not found.' });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'All copies of this title are currently in circulation. None available.',
      });
    }

    // Check if student already has active issue of this book
    const existing = await BookIssue.findOne({
      bookId,
      studentId,
      status: { $in: ['ISSUED', 'OVERDUE'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student already has an active borrow copy of this book.',
      });
    }

    // Default 14 days due date
    const returnDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const issueRecord = await BookIssue.create({
      bookId,
      studentId,
      issuedBy: req.user._id,
      issueDate: new Date(),
      dueDate: returnDueDate,
      status: 'ISSUED',
      remarks: remarks || '',
    });

    // Decrement available copies
    book.availableCopies -= 1;
    if (book.availableCopies <= 0) {
      book.status = 'OUT_OF_STOCK';
    }
    await book.save();

    const populated = await BookIssue.findById(issueRecord._id)
      .populate('bookId', 'title isbn author category')
      .populate('studentId', 'fullName registrationNumber');

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" successfully issued to ${student.fullName}. Due on ${returnDueDate.toLocaleDateString()}.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/library/issues/:id/return (Return book)
export const returnBook = async (req, res, next) => {
  try {
    const issue = await BookIssue.findById(req.params.id).populate('bookId').populate('studentId');
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Borrow record not found.' });
    }

    if (issue.status === 'RETURNED') {
      return res.status(400).json({ success: false, message: 'Book has already been returned.' });
    }

    const { finePaid = false, waived = false } = req.body;
    const returnDate = new Date();
    issue.returnDate = returnDate;

    // Check overdue
    if (returnDate > new Date(issue.dueDate)) {
      const daysLate = Math.ceil((returnDate - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
      issue.fineAmount = daysLate * 5; // ₹5/day
      if (waived) {
        issue.fineStatus = 'WAIVED';
      } else if (finePaid) {
        issue.fineStatus = 'PAID';
      } else {
        issue.fineStatus = 'UNPAID';
      }
    } else {
      issue.fineAmount = 0;
      issue.fineStatus = 'NO_FINE';
    }

    issue.status = 'RETURNED';
    await issue.save();

    // Increment available copies
    const book = await Book.findById(issue.bookId._id);
    if (book) {
      book.availableCopies += 1;
      book.status = 'AVAILABLE';
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: `Book "${issue.bookId.title}" returned successfully.${
        issue.fineAmount > 0 ? ` Overdue fine: ₹${issue.fineAmount} (${issue.fineStatus})` : ''
      }`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/library/stats
export const getLibraryStats = async (req, res, next) => {
  try {
    const [totalBooks, booksAggregate, issuedCount, overdueCount, returnedCount] = await Promise.all([
      Book.countDocuments(),
      Book.aggregate([
        {
          $group: {
            _id: null,
            totalCopies: { $sum: '$totalCopies' },
            availableCopies: { $sum: '$availableCopies' },
          },
        },
      ]),
      BookIssue.countDocuments({ status: 'ISSUED' }),
      BookIssue.countDocuments({
        status: 'ISSUED',
        dueDate: { $lt: new Date() },
      }),
      BookIssue.countDocuments({ status: 'RETURNED' }),
    ]);

    const totalCopies = booksAggregate[0]?.totalCopies || 0;
    const availableCopies = booksAggregate[0]?.availableCopies || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        totalCopies,
        availableCopies,
        issuedCount,
        overdueCount,
        returnedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
