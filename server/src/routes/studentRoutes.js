import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudents,
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'), getAllStudents);
router.get('/export/csv', authorize('ADMIN', 'SUPER_ADMIN'), exportStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createStudent);
router.patch('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateStudent);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteStudent);

export default router;
