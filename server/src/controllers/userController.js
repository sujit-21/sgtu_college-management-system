import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  TeacherProfile,
  Department,
  Course,
  AuditLog,
} from '../models/index.js';

// 1. GET ALL USERS (with search, filter, pagination, and profile hydration)
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      search = '',
      role = '',
      status = '',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { email: { $regex: search.trim(), $options: 'i' } },
        { collegeId: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (role && role !== 'ALL') {
      query.role = role.toUpperCase();
    }

    if (status && status !== 'ALL') {
      query.isActive = status === 'ACTIVE';
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const totalCount = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    // Hydrate names from StudentProfile or TeacherProfile
    const userIds = users.map((u) => u._id);
    const [studentProfiles, teacherProfiles] = await Promise.all([
      StudentProfile.find({ userId: { $in: userIds } }).populate('departmentId', 'name code').lean(),
      TeacherProfile.find({ userId: { $in: userIds } }).populate('departmentId', 'name code').lean(),
    ]);

    const studentMap = new Map(studentProfiles.map((sp) => [sp.userId.toString(), sp]));
    const teacherMap = new Map(teacherProfiles.map((tp) => [tp.userId.toString(), tp]));

    const hydratedUsers = users.map((user) => {
      const sProf = studentMap.get(user._id.toString());
      const tProf = teacherMap.get(user._id.toString());
      return {
        ...user,
        fullName: sProf?.fullName || tProf?.fullName || (user.role === 'ADMIN' ? 'System Administrator' : user.role),
        departmentName: sProf?.departmentId?.name || tProf?.departmentId?.name || 'General Administration',
        phone: sProf?.phone || tProf?.phone || 'N/A',
      };
    });

    // Aggregate statistics
    const [totalUsers, activeUsers, studentsCount, facultyCount, hodCount, staffCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'TEACHER' }),
      User.countDocuments({ role: 'HOD' }),
      User.countDocuments({ role: { $in: ['LIBRARIAN', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'] } }),
    ]);

    res.json({
      success: true,
      totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      stats: {
        totalUsers,
        activeUsers,
        studentsCount,
        facultyCount,
        hodCount,
        staffCount,
      },
      data: hydratedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET USER BY ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await StudentProfile.findOne({ userId: user._id })
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code');
    } else if (user.role === 'TEACHER' || user.role === 'HOD') {
      profile = await TeacherProfile.findOne({ userId: user._id })
        .populate('departmentId', 'name code');
    }

    res.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE NEW USER & ASSIGN ID AND PASSWORD (CRUD - Create)
export const createUser = async (req, res, next) => {
  try {
    const {
      collegeId,
      email,
      password,
      role = 'STUDENT',
      fullName = '',
      phone = '',
      departmentId,
      designation,
    } = req.body;

    if (!collegeId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'College ID / Registration ID, email address, and initial password are required.',
      });
    }

    const cleanId = collegeId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    const existing = await User.findOne({
      $or: [{ collegeId: cleanId }, { email: cleanEmail }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this College ID or Email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      collegeId: cleanId,
      email: cleanEmail,
      password: hashedPassword,
      role: role.toUpperCase(),
      isActive: true,
    });

    // Create linked profile if relevant
    let defaultDeptId = departmentId;
    if (!defaultDeptId) {
      const firstDept = await Department.findOne();
      if (firstDept) defaultDeptId = firstDept._id;
    }

    if (newUser.role === 'STUDENT') {
      let defaultCourseId = req.body.courseId;
      if (!defaultCourseId) {
        const course = (await Course.findOne({ departmentId: defaultDeptId })) || (await Course.findOne());
        if (course) defaultCourseId = course._id;
      }
      await StudentProfile.create({
        userId: newUser._id,
        registrationNumber: cleanId,
        fullName: fullName || 'New Student',
        phone: phone || '+91 99000 00000',
        departmentId: defaultDeptId,
        courseId: defaultCourseId,
        currentSemester: 1,
        admissionYear: new Date().getFullYear(),
        academicStatus: 'ACTIVE',
      });
    } else if (newUser.role === 'TEACHER' || newUser.role === 'HOD') {
      await TeacherProfile.create({
        userId: newUser._id,
        employeeId: cleanId,
        fullName: fullName || (newUser.role === 'HOD' ? 'Department Head' : 'Faculty Member'),
        phone: phone || '+91 98000 00000',
        designation: designation || (newUser.role === 'HOD' ? 'Professor & HOD' : 'Assistant Professor'),
        departmentId: defaultDeptId,
        joiningDate: new Date().toISOString().split('T')[0],
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'ADMIN_CREATE_USER',
      resource: 'USERS',
      details: `Admin assigned ID '${cleanId}' and password for user '${cleanEmail}' with role '${newUser.role}'.`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: `User '${cleanEmail}' created successfully with assigned ID '${cleanId}'.`,
      data: {
        _id: newUser._id,
        collegeId: newUser.collegeId,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE USER DETAILS & ASSIGN ID/PASSWORD (CRUD - Update)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { collegeId, email, role, isActive, password, fullName, phone } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check conflict if changing email or collegeId
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email is already in use by another account.' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (collegeId && collegeId.toUpperCase() !== user.collegeId) {
      const idExists = await User.findOne({ collegeId: collegeId.toUpperCase() });
      if (idExists) {
        return res.status(409).json({ success: false, message: 'College ID is already in use by another account.' });
      }
      user.collegeId = collegeId.toUpperCase().trim();
    }

    if (role) {
      user.role = role.toUpperCase();
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }

    // If Admin assigned a new password in the update payload
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }
      user.password = await bcrypt.hash(password.trim(), 10);
    }

    await user.save();

    // Synchronize ID and Name on profiles
    if (user.role === 'STUDENT') {
      const sProf = await StudentProfile.findOne({ userId: user._id });
      if (sProf) {
        if (collegeId) sProf.registrationNumber = user.collegeId;
        if (fullName) sProf.fullName = fullName;
        if (phone) sProf.phone = phone;
        await sProf.save();
      }
    } else if (user.role === 'TEACHER' || user.role === 'HOD') {
      const tProf = await TeacherProfile.findOne({ userId: user._id });
      if (tProf) {
        if (collegeId) tProf.employeeId = user.collegeId;
        if (fullName) tProf.fullName = fullName;
        if (phone) tProf.phone = phone;
        await tProf.save();
      }
    }

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'ADMIN_UPDATE_USER',
      resource: 'USERS',
      details: `Admin updated account '${user.email}' (ID: ${user.collegeId}, Role: ${user.role}, Password Updated: ${Boolean(password)}).`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: `User '${user.email}' updated successfully.`,
      data: {
        _id: user._id,
        collegeId: user.collegeId,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. DIRECT PASSWORD ASSIGNMENT / RESET BY ADMIN
export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be provided and must be at least 6 characters long.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = await bcrypt.hash(newPassword.trim(), 10);
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'ADMIN_PASSWORD_RESET',
      resource: 'USERS',
      details: `Admin assigned new password to user '${user.email}' (College ID: ${user.collegeId}).`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: `Password successfully updated for '${user.email}' (${user.collegeId}). User can now log in with the new credentials.`,
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE USER (CRUD - Delete)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent Admin from deleting own account
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Cascade delete linked profiles
    if (user.role === 'STUDENT') {
      await StudentProfile.deleteOne({ userId: user._id });
    } else if (user.role === 'TEACHER' || user.role === 'HOD') {
      await TeacherProfile.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'ADMIN_DELETE_USER',
      resource: 'USERS',
      details: `Admin deleted user account '${user.email}' (College ID: ${user.collegeId}, Role: ${user.role}).`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: `User '${user.email}' and associated profiles have been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};
