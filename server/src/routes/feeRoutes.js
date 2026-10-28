import express from 'express';
import {
  getFeeInvoices,
  createFeeInvoice,
  recordPayment,
  getFeeCategories,
} from '../controllers/feeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/invoices', getFeeInvoices);
router.post('/invoices', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), createFeeInvoice);
router.post('/payments', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT', 'STUDENT'), recordPayment);
router.get('/categories', getFeeCategories);

export default router;
