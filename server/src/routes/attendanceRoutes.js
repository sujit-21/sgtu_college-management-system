import express from 'express';
import {
  getAttendance,
  markClassAttendance,
  getStudentAttendanceSummary,
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAttendance);
router.post('/mark', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), markClassAttendance);
router.get('/summary', getStudentAttendanceSummary);
router.get('/summary/:studentId', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getStudentAttendanceSummary);

export default router;
