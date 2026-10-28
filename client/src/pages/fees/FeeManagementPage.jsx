import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  Plus,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Download,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const FeeManagementPage = () => {
  const { user } = useAuth();
  const isAdminOrAccountant =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'ACCOUNTANT';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    title: '',
    totalAmount: 65000,
    dueDate: '',
    semester: 1,
  });
  const [students, setStudents] = useState([]);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'ONLINE',
  });

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/fees/invoices?status=${statusFilter}` : '/fees/invoices';
      const res = await api.get(url);
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    if (isAdminOrAccountant) {
      const fetchStudents = async () => {
        try {
          const res = await api.get('/students?limit=50');
          if (res.data.success) setStudents(res.data.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchStudents();
    }
  }, [isAdminOrAccountant, statusFilter]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/fees/invoices', invoiceForm);
      if (res.data.success) {
        setIsInvoiceModalOpen(false);
        loadInvoices();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayInvoice = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setActionLoading(true);
    try {
      const res = await api.post('/fees/payments', {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
      });

      if (res.data.success) {
        setIsPayModalOpen(false);
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setSelectedPayment(res.data.data.payment);
        setIsReceiptModalOpen(true);
        loadInvoices();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment transaction failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Invoices, Receipts & Financial Accounts"
        description="Review semester fee invoices, process transactions, and download official payment receipts."
      >
        {isAdminOrAccountant && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInvoiceModalOpen(true)}
            icon={Plus}
          >
            Create Fee Invoice
          </Button>
        )}
      </PageHeader>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Invoiced</span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">{invoices.length} invoices generated</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Collected</span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{totalPaid.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Verified bank receipts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <span className="text-xs text-slate-400 font-semibold uppercase">Outstanding Balance</span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-500">
            ₹{totalOutstanding.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Due for upcoming academic session</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Semester Invoices & History
          </h3>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-2.5 py-1.5"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="UNPAID">UNPAID</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading fee records...</div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No invoices on record.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-navy-950 border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Invoice #</th>
                  {isAdminOrAccountant && <th className="px-5 py-3">Student</th>}
                  <th className="px-5 py-3">Fee Description</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Paid Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40">
                    <td className="px-5 py-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {inv.invoiceNumber}
                    </td>
                    {isAdminOrAccountant && (
                      <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {inv.studentId?.fullName} ({inv.studentId?.registrationNumber})
                      </td>
                    )}
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {inv.title}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {inv.status !== 'PAID' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentForm({
                              amount: String(inv.totalAmount - inv.paidAmount),
                              paymentMethod: 'ONLINE',
                            });
                            setIsPayModalOpen(true);
                          }}
                        >
                          {isAdminOrAccountant ? 'Record Payment' : 'Pay Now'}
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Invoice Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Process Fee Payment"
        subtitle={`Invoice: ${selectedInvoice?.invoiceNumber} (${selectedInvoice?.title})`}
      >
        <form onSubmit={handlePayInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Payment Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Payment Method *</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            >
              <option value="ONLINE">Online Net Banking / UPI</option>
              <option value="BANK_TRANSFER">Direct NEFT / RTGS Transfer</option>
              <option value="CASH">Cash Counter</option>
              <option value="CHEQUE">Demand Draft / Cheque</option>
            </select>
          </div>

          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-brand-500" />
            <span>Bank-grade 256-bit SSL encrypted financial transaction gateway.</span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official University Payment Receipt"
        subtitle="Institutional Cashier / Accounting Department"
      >
        {selectedPayment && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt No:</span>
                <span className="font-mono font-bold">{selectedPayment.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono">{selectedPayment.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Date:</span>
                <span>{new Date(selectedPayment.paymentDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-semibold">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-navy-800 text-sm">
                <span className="font-bold">Amount Paid:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  ₹{selectedPayment.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => window.print()} icon={Download}>
                Print Receipt
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsReceiptModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Fee Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Fee Invoice"
        subtitle="Issue semester tuition or lab fee charge to a student."
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Student *</label>
            <select
              required
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            >
              <option value="">Select Enrolled Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.registrationNumber}) - Sem {s.currentSemester}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Invoice Title *</label>
            <input
              type="text"
              required
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              placeholder="e.g. Semester 6 Academic & Laboratory Tuition"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Total Amount (₹) *</label>
              <input
                type="number"
                required
                value={invoiceForm.totalAmount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
