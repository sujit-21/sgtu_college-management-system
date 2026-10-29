import jwt from 'jsonwebtoken';
import { User, StudentProfile, TeacherProfile } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'sg18_apex_university_secret_jwt_key_2026_super_secure_random_token'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or has been deactivated.',
      });
    }

    req.user = user;

    // Hydrate profile if student or teacher
    if (user.role === 'STUDENT') {
      const studentProfile = await StudentProfile.findOne({ userId: user._id })
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code');
      req.studentProfile = studentProfile;
    } else if (user.role === 'TEACHER' || user.role === 'HOD') {
      const teacherProfile = await TeacherProfile.findOne({ userId: user._id })
        .populate('departmentId', 'name code');
      req.teacherProfile = teacherProfile;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user ? req.user.role : 'UNKNOWN'}'.`,
      });
    }
    next();
  };
};
