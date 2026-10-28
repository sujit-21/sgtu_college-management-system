import express from 'express';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionsForAssignment,
} from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAssignments);
router.post('/', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), createAssignment);
router.post('/:id/submit', authorize('STUDENT'), submitAssignment);
router.get('/:id/submissions', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), getSubmissionsForAssignment);
router.patch('/submissions/:submissionId/grade', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), gradeSubmission);

export default router;
