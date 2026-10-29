import express from 'express';
import {
  getFeeInvoices,
  createFeeInvoice,
  recordPayment,
  getFeeCategories,
  getScholarships,
  createScholarship,
  updateScholarshipStatus,
  setupInstallmentPlan,
  sendInstallmentReminder,
  getLedgerSummary,
} from '../controllers/feeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Fee Invoices & Payments
router.get('/invoices', getFeeInvoices);
router.post('/invoices', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), createFeeInvoice);
router.post('/invoices/:id/setup-installments', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), setupInstallmentPlan);
router.post('/invoices/:id/installments/:instNum/reminder', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), sendInstallmentReminder);
router.post('/payments', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT', 'STUDENT'), recordPayment);

// Scholarships & Concession Ledger
router.get('/scholarships', getScholarships);
router.post('/scholarships', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), createScholarship);
router.patch('/scholarships/:id', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), updateScholarshipStatus);

// Ledger Summary & Categories
router.get('/ledger/summary', getLedgerSummary);
router.get('/categories', getFeeCategories);

export default router;
