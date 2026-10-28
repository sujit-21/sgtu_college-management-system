import express from 'express';
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllDepartments);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createDepartment);
router.patch('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateDepartment);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteDepartment);

export default router;
