import { Course, Subject, StudentProfile } from '../models/index.js';

export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('departmentId', 'name code')
      .sort({ code: 1 });

    const results = await Promise.all(
      courses.map(async (c) => {
        const [subjectCount, studentCount] = await Promise.all([
          Subject.countDocuments({ courseId: c._id }),
          StudentProfile.countDocuments({ courseId: c._id }),
        ]);
        return {
          ...c.toObject(),
          subjectCount,
          studentCount,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { code, name, description, durationYears, totalSemesters, credits, departmentId } = req.body;
    if (!code || !name || !departmentId) {
      return res.status(400).json({ success: false, message: 'Code, name, and department are required.' });
    }

    const course = await Course.create({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description,
      durationYears: Number(durationYears) || 4,
      totalSemesters: Number(totalSemesters) || 8,
      credits: Number(credits) || 160,
      departmentId,
    });

    const populated = await Course.findById(course._id).populate('departmentId', 'name code');
    res.status(201).json({ success: true, message: 'Course created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('departmentId', 'name code');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    res.json({ success: true, message: 'Course updated successfully.', data: course });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const hasStudents = await StudentProfile.exists({ courseId: req.params.id });
    if (hasStudents) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with enrolled students. Archive course or reassign students first.',
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
