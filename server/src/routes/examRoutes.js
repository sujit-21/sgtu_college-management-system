import express from 'express';
import {
  getExaminations,
  createExamination,
  enterMarks,
  publishResults,
  getResultsForExam,
  getAdmitCard,
  applyRevaluation,
  getRevaluations,
  updateRevaluationStatus,
  getBacklogSubjects,
  registerBacklogExam,
  getExamModerationAnalytics,
  applyGraceMarks,
} from '../controllers/examController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getExaminations);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createExamination);
router.post('/marks', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), enterMarks);
router.patch('/:examinationId/publish', authorize('ADMIN', 'SUPER_ADMIN'), publishResults);
router.get('/:examinationId/results', getResultsForExam);

// 1. Official Admit Card / Hall Ticket
router.get('/:examinationId/admit-card', getAdmitCard);
router.get('/:examinationId/admit-card/:studentId', getAdmitCard);

// 2. Revaluation & Rechecking Portal
router.get('/revaluation/list', getRevaluations);
router.post('/revaluation/apply', applyRevaluation);
router.patch('/revaluation/:id/status', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN', 'HOD'), updateRevaluationStatus);

// 3. Backlog & Supplementary Exams
router.get('/backlogs/my-list', getBacklogSubjects);
router.get('/backlogs/:studentId', getBacklogSubjects);
router.post('/backlogs/register', registerBacklogExam);

// 4. Statistical Moderation & Grace Marks
router.get('/:examinationId/moderation', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN', 'HOD'), getExamModerationAnalytics);
router.post('/:examinationId/moderation/grace-marks', authorize('ADMIN', 'SUPER_ADMIN', 'HOD'), applyGraceMarks);

export default router;
