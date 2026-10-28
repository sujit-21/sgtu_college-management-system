import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'), createAnnouncement);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteAnnouncement);

export default router;
