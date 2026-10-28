import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, StudentProfile, TeacherProfile, AuditLog } from '../models/index.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'sg18_apex_university_secret_jwt_key_2026_super_secure_random_token',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or College ID, and your password.',
      });
    }

    const cleanIdentifier = identifier.trim();

    // Find by email or collegeId
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { collegeId: cleanIdentifier.toUpperCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/ID and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administration.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/ID and password.',
      });
    }

    const token = generateToken(user._id);

    // Cookie configuration
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Hydrate profile
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await StudentProfile.findOne({ userId: user._id })
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code');
    } else if (user.role === 'TEACHER') {
      profile = await TeacherProfile.findOne({ userId: user._id })
        .populate('departmentId', 'name code');
    }

    // Audit log
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resource: 'AUTH',
      details: `User with role ${user.role} logged in successfully`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        collegeId: user.collegeId,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = req.studentProfile || req.teacherProfile || null;

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        collegeId: user.collegeId,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  // Security conscious: return standard message whether email exists or not
  res.json({
    success: true,
    message: 'If an account exists with that email address, password reset instructions have been generated.',
  });
};
