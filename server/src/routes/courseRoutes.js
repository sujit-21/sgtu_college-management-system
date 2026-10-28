import express from 'express';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllCourses);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createCourse);
router.patch('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateCourse);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteCourse);

export default router;
