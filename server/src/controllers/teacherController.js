import bcrypt from 'bcryptjs';
import { User, TeacherProfile, Department, Subject, AuditLog } from '../models/index.js';

export const getAllTeachers = async (req, res, next) => {
  try {
    const { search, departmentId, designation, page = 1, limit = 10 } = req.query;
    const query = {};

    if (departmentId) query.departmentId = departmentId;
    if (designation) query.designation = designation;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [teachers, total] = await Promise.all([
      TeacherProfile.find(query)
        .populate('userId', 'email collegeId isActive')
        .populate('departmentId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TeacherProfile.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: teachers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id)
      .populate('userId', 'email collegeId isActive')
      .populate('departmentId', 'name code');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher record not found.' });
    }

    const assignedSubjects = await Subject.find({ teacherId: teacher._id }).populate('courseId');

    res.json({
      success: true,
      data: {
        ...teacher.toObject(),
        subjects: assignedSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      employeeId,
      phone,
      departmentId,
      designation = 'Assistant Professor',
      qualification = 'M.Tech / Ph.D',
      specialization,
      joiningDate = new Date().toISOString().split('T')[0],
      password = 'Teacher@123',
    } = req.body;

    if (!fullName || !email || !employeeId || !phone || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, employee ID, phone, and department are required.',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { collegeId: employeeId.toUpperCase() }],
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or employee ID already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      collegeId: employeeId.toUpperCase(),
      password: hashedPassword,
      role: 'TEACHER',
    });

    const teacher = await TeacherProfile.create({
      userId: user._id,
      employeeId: employeeId.toUpperCase(),
      fullName,
      phone,
      departmentId,
      designation,
      qualification,
      specialization,
      joiningDate,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'CREATE_TEACHER',
      resource: 'TEACHER',
      details: `Created faculty profile for ${fullName} (${employeeId})`,
      ipAddress: req.ip,
    });

    const populated = await TeacherProfile.findById(teacher._id)
      .populate('userId', 'email collegeId isActive')
      .populate('departmentId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Teacher profile created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher record not found.' });
    }

    const allowed = ['fullName', 'phone', 'designation', 'qualification', 'specialization', 'departmentId', 'avatar'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) teacher[f] = req.body[f];
    });

    await teacher.save();

    const updated = await TeacherProfile.findById(teacher._id)
      .populate('userId', 'email collegeId isActive')
      .populate('departmentId', 'name code');

    res.json({
      success: true,
      message: 'Teacher updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher record not found.' });
    }

    await User.findByIdAndUpdate(teacher.userId, { isActive: false });

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'DEACTIVATE_TEACHER',
      resource: 'TEACHER',
      details: `Deactivated faculty ${teacher.employeeId}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Teacher account deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
