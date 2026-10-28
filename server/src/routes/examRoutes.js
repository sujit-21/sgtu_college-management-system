import express from 'express';
import {
  getExaminations,
  createExamination,
  enterMarks,
  publishResults,
  getResultsForExam,
} from '../controllers/examController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getExaminations);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createExamination);
router.post('/marks', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), enterMarks);
router.patch('/:examinationId/publish', authorize('ADMIN', 'SUPER_ADMIN'), publishResults);
router.get('/:examinationId/results', getResultsForExam);

export default router;
