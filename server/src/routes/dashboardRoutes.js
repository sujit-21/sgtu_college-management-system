import express from 'express';
import {
  getAdminDashboardStats,
  getTeacherDashboardStats,
  getStudentDashboardStats,
} from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), getAdminDashboardStats);
router.get('/teacher', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getTeacherDashboardStats);
router.get('/student', authorize('STUDENT', 'ADMIN', 'SUPER_ADMIN'), getStudentDashboardStats);

export default router;
