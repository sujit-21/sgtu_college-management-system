import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookIssues,
  issueBook,
  returnBook,
  getLibraryStats,
} from '../controllers/libraryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all library routes
router.use(authenticate);

// Public catalogue for authenticated university members
router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.get('/stats', getLibraryStats);

// Administrative book management
router.post('/books', authorize('ADMIN', 'SUPER_ADMIN', 'LIBRARIAN'), createBook);
router.put('/books/:id', authorize('ADMIN', 'SUPER_ADMIN', 'LIBRARIAN'), updateBook);
router.delete('/books/:id', authorize('ADMIN', 'SUPER_ADMIN', 'LIBRARIAN'), deleteBook);

// Circulations & Borrowing
router.get('/issues', getBookIssues);
router.post('/issues', authorize('ADMIN', 'SUPER_ADMIN', 'LIBRARIAN', 'TEACHER'), issueBook);
router.post('/issues/:id/return', authorize('ADMIN', 'SUPER_ADMIN', 'LIBRARIAN', 'TEACHER'), returnBook);

export default router;
