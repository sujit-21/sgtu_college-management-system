import express from 'express';
import {
  getAdminDashboardStats,
  getTeacherDashboardStats,
  getStudentDashboardStats,
  getHodDashboardStats,
  getLibrarianDashboardStats,
} from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), getAdminDashboardStats);
router.get('/teacher', authorize('TEACHER', 'HOD', 'ADMIN', 'SUPER_ADMIN'), getTeacherDashboardStats);
router.get('/student', authorize('STUDENT', 'ADMIN', 'SUPER_ADMIN'), getStudentDashboardStats);
router.get('/hod', authorize('HOD', 'ADMIN', 'SUPER_ADMIN'), getHodDashboardStats);
router.get('/librarian', authorize('LIBRARIAN', 'ADMIN', 'SUPER_ADMIN'), getLibrarianDashboardStats);

export default router;
