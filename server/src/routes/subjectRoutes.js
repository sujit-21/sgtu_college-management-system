import express from 'express';
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllSubjects);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createSubject);
router.patch('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateSubject);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteSubject);

export default router;
