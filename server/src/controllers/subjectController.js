import { Subject, Course, TeacherProfile } from '../models/index.js';

export const getAllSubjects = async (req, res, next) => {
  try {
    const { courseId, semester, teacherId } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;
    if (semester) query.semester = Number(semester);
    if (teacherId) query.teacherId = teacherId;

    const subjects = await Subject.find(query)
      .populate('courseId', 'name code')
      .populate('teacherId', 'fullName employeeId designation')
      .sort({ semester: 1, code: 1 });

    res.json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { code, name, semester = 1, credits = 4, courseId, teacherId } = req.body;
    if (!code || !name || !courseId) {
      return res.status(400).json({ success: false, message: 'Subject code, name, and course are required.' });
    }

    const subject = await Subject.create({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      semester: Number(semester),
      credits: Number(credits),
      courseId,
      teacherId: teacherId || null,
    });

    const populated = await Subject.findById(subject._id)
      .populate('courseId', 'name code')
      .populate('teacherId', 'fullName employeeId');

    res.status(201).json({ success: true, message: 'Subject created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('courseId', 'name code')
      .populate('teacherId', 'fullName employeeId');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    res.json({ success: true, message: 'Subject updated successfully.', data: subject });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject removed successfully.' });
  } catch (error) {
    next(error);
  }
};
