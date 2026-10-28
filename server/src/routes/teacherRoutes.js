import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createTeacher);
router.patch('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateTeacher);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteTeacher);

export default router;
