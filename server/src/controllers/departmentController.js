import { Department, Course, TeacherProfile, StudentProfile } from '../models/index.js';

export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ code: 1 });

    // Include statistics
    const results = await Promise.all(
      departments.map(async (dept) => {
        const [courseCount, teacherCount, studentCount] = await Promise.all([
          Course.countDocuments({ departmentId: dept._id }),
          TeacherProfile.countDocuments({ departmentId: dept._id }),
          StudentProfile.countDocuments({ departmentId: dept._id }),
        ]);

        return {
          ...dept.toObject(),
          courseCount,
          teacherCount,
          studentCount,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { code, name, description, headName } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Department code and name are required.' });
    }

    const dept = await Department.create({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description,
      headName,
    });

    res.status(201).json({ success: true, message: 'Department created successfully.', data: dept });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.json({ success: true, message: 'Department updated.', data: dept });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const hasCourses = await Course.exists({ departmentId: req.params.id });
    if (hasCourses) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with active courses. Reassign or remove courses first.',
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
