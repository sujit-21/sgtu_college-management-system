import bcrypt from 'bcryptjs';
import { User, StudentProfile, Department, Course, AuditLog } from '../models/index.js';

export const getAllStudents = async (req, res, next) => {
  try {
    const {
      search,
      departmentId,
      courseId,
      semester,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (departmentId) query.departmentId = departmentId;
    if (courseId) query.courseId = courseId;
    if (semester) query.currentSemester = Number(semester);
    if (status) query.academicStatus = status;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [students, total] = await Promise.all([
      StudentProfile.find(query)
        .populate('userId', 'email collegeId isActive')
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      StudentProfile.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: students,
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

export const getStudentById = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.id)
      .populate('userId', 'email collegeId isActive createdAt')
      .populate('departmentId', 'name code headName')
      .populate('courseId', 'name code durationYears totalSemesters');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Role ownership check: student can only view their own profile unless admin/teacher
    if (req.user.role === 'STUDENT' && req.studentProfile && req.studentProfile._id.toString() !== student._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this student profile.' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      registrationNumber,
      phone,
      departmentId,
      courseId,
      currentSemester = 1,
      admissionYear = 2026,
      gender = 'Male',
      dateOfBirth,
      address,
      bloodGroup,
      password = 'Student@123',
      aadhaarNumber,
      caste = 'General',
      fatherName,
      motherName,
      emergencyContact,
      tenthMarks,
      tenthBoard = 'CBSE',
      tenthPassingYear = 2020,
      twelfthMarks,
      twelfthBoard = 'CBSE',
      twelfthPassingYear = 2022,
      twelfthStream = 'Science (PCM)',
    } = req.body;

    if (!fullName || !email || !registrationNumber || !phone || !departmentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, registration number, phone, department, and course are required.',
      });
    }

    // Check duplicate email or registration number
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { collegeId: registrationNumber.toUpperCase() }],
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or registration number already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      collegeId: registrationNumber.toUpperCase(),
      password: hashedPassword,
      role: 'STUDENT',
    });

    const studentProfile = await StudentProfile.create({
      userId: user._id,
      registrationNumber: registrationNumber.toUpperCase(),
      fullName,
      phone,
      dateOfBirth,
      address,
      gender,
      bloodGroup,
      currentSemester: Number(currentSemester),
      admissionYear: Number(admissionYear),
      departmentId,
      courseId,
      aadhaarNumber,
      caste,
      fatherName,
      motherName,
      emergencyContact,
      tenthMarks: tenthMarks !== undefined && tenthMarks !== '' ? Number(tenthMarks) : undefined,
      tenthBoard,
      tenthPassingYear: tenthPassingYear ? Number(tenthPassingYear) : 2020,
      twelfthMarks: twelfthMarks !== undefined && twelfthMarks !== '' ? Number(twelfthMarks) : undefined,
      twelfthBoard,
      twelfthPassingYear: twelfthPassingYear ? Number(twelfthPassingYear) : 2022,
      twelfthStream,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    });

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'CREATE_STUDENT',
      resource: 'STUDENT',
      details: `Created student ${fullName} (${registrationNumber})`,
      ipAddress: req.ip,
    });

    const populated = await StudentProfile.findById(studentProfile._id)
      .populate('userId', 'email collegeId isActive')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const allowedUpdates = [
      'fullName',
      'phone',
      'dateOfBirth',
      'address',
      'gender',
      'bloodGroup',
      'currentSemester',
      'academicStatus',
      'departmentId',
      'courseId',
      'avatar',
      'aadhaarNumber',
      'caste',
      'fatherName',
      'motherName',
      'emergencyContact',
      'tenthMarks',
      'tenthBoard',
      'tenthPassingYear',
      'twelfthMarks',
      'twelfthBoard',
      'twelfthPassingYear',
      'twelfthStream',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'tenthMarks' || field === 'twelfthMarks') {
          student[field] = req.body[field] === '' ? undefined : Number(req.body[field]);
        } else if (field === 'tenthPassingYear' || field === 'twelfthPassingYear' || field === 'currentSemester') {
          student[field] = req.body[field] === '' ? undefined : Number(req.body[field]);
        } else {
          student[field] = req.body[field];
        }
      }
    });

    // Admin password or ID assignment during update
    if (req.body.password && req.body.password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(req.body.password.trim(), 10);
      await User.findByIdAndUpdate(student.userId, { password: hashedPassword });
    }
    if (req.body.registrationNumber && req.body.registrationNumber.trim().toUpperCase() !== student.registrationNumber) {
      student.registrationNumber = req.body.registrationNumber.trim().toUpperCase();
      await User.findByIdAndUpdate(student.userId, { collegeId: student.registrationNumber });
    }

    await student.save();

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'UPDATE_STUDENT',
      resource: 'STUDENT',
      details: `Updated details for student ${student.registrationNumber}`,
      ipAddress: req.ip,
    });

    const updated = await StudentProfile.findById(student._id)
      .populate('userId', 'email collegeId isActive')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code');

    res.json({
      success: true,
      message: 'Student details updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Deactivate user or soft delete
    await User.findByIdAndUpdate(student.userId, { isActive: false });
    student.academicStatus = 'SUSPENDED';
    await student.save();

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'DEACTIVATE_STUDENT',
      resource: 'STUDENT',
      details: `Deactivated student record for ${student.registrationNumber}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Student account has been deactivated.',
    });
  } catch (error) {
    next(error);
  }
};

export const exportStudents = async (req, res, next) => {
  try {
    const students = await StudentProfile.find()
      .populate('userId', 'email collegeId')
      .populate('departmentId', 'code')
      .populate('courseId', 'code');

    const headers = 'Registration No,Full Name,Email,Phone,Department,Course,Semester,Caste,Aadhaar No,10th Marks (%),12th Marks (%),Status\n';
    const rows = students
      .map(
        (s) =>
          `"${s.registrationNumber}","${s.fullName}","${s.userId?.email || ''}","${s.phone}","${s.departmentId?.code || ''}","${s.courseId?.code || ''}","${s.currentSemester}","${s.caste || 'General'}","${s.aadhaarNumber || 'N/A'}","${s.tenthMarks ?? 'N/A'}","${s.twelfthMarks ?? 'N/A'}","${s.academicStatus}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
    res.send(headers + rows);
  } catch (error) {
    next(error);
  }
};
