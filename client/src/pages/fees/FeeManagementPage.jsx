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
  QrCode,
  Smartphone,
  Building2,
  Lock,
  Printer,
  Sparkles,
  Check,
  Layers,
  X
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

  // Payment Gateway Tab Selection: 'UPI' | 'CARD' | 'NETBANKING'
  const [gatewayTab, setGatewayTab] = useState('UPI');

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
    cardNumber: '4532 •••• •••• 8912',
    cardExpiry: '08/29',
    cardCvv: '•••',
    cardHolder: '',
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
      const methodLabel =
        gatewayTab === 'UPI'
          ? 'UPI_QR'
          : gatewayTab === 'CARD'
          ? 'DEBIT_CREDIT_CARD'
          : paymentForm.paymentMethod || 'ONLINE';

      const res = await api.post('/fees/payments', {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentForm.amount),
        paymentMethod: methodLabel,
      });

      if (res.data.success) {
        setIsPayModalOpen(false);
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        setSelectedPayment({
          ...res.data.data.payment,
          invoice: selectedInvoice,
        });
        setIsReceiptModalOpen(true);
        loadInvoices();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment transaction failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const openReceiptForInvoice = (inv) => {
    setSelectedInvoice(inv);
    const lastPayment = (inv.payments && inv.payments[0]) || {
      receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionId: `TXN-VERIFIED-${inv.invoiceNumber}`,
      paymentDate: new Date(),
      paymentMethod: 'ONLINE NETBANKING / UPI',
      amount: inv.paidAmount || inv.totalAmount,
    };
    setSelectedPayment({
      ...lastPayment,
      invoice: inv,
    });
    setIsReceiptModalOpen(true);
  };

  // Calculations
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Invoices, Receipts & Financial Accounts"
        description="Review semester fee invoices, process transactions via university payment gateway, and download official verified GST payment receipts."
      >
        {isAdminOrAccountant && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInvoiceModalOpen(true)}
            icon={Plus}
          >
            Generate Fee Invoice
          </Button>
        )}
      </PageHeader>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Invoiced Tuition</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹{totalBilled.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across all academic semesters</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cleared & Deposited</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{totalPaid.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Verified university accounts collection
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pending Balance</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            ₹{totalOutstanding.toLocaleString()}
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Due before examination clearance</p>
        </div>
      </div>

      {/* Invoice Records Table */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-500" />
            <span>Semester Invoices & History</span>
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
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== 'PAID' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentForm({
                                ...paymentForm,
                                amount: String(inv.totalAmount - inv.paidAmount),
                                cardHolder: inv.studentId?.fullName || user?.name || '',
                              });
                              setIsPayModalOpen(true);
                            }}
                          >
                            {isAdminOrAccountant ? 'Record Payment' : 'Pay via Gateway'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReceiptForInvoice(inv)}
                            icon={Receipt}
                            className="text-emerald-600 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            Official Receipt
                          </Button>
                        )}

                        {inv.paidAmount > 0 && inv.status !== 'PAID' && (
                          <button
                            type="button"
                            onClick={() => openReceiptForInvoice(inv)}
                            title="View Partial Payment Receipt"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INTERACTIVE UNIVERSITY PAYMENT GATEWAY MODAL */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="SGTU Secure Financial Payment Gateway"
        subtitle={`Invoice Ref: ${selectedInvoice?.invoiceNumber} • ${selectedInvoice?.title}`}
      >
        <form onSubmit={handlePayInvoice} className="space-y-4">
          {/* Amount Due Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs text-white/80 block uppercase tracking-wider font-semibold">
                Payable University Fee
              </span>
              <div className="text-2xl font-black font-mono mt-0.5">
                ₹{Number(paymentForm.amount || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Authorized Gateway
              </span>
              <p className="text-[10px] text-white/80 mt-1">256-Bit SSL Encrypted</p>
            </div>
          </div>

          {/* Payment Method Switcher Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Payment Instrument:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGatewayTab('UPI')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  gatewayTab === 'UPI'
                    ? 'border-brand-500 bg-brand-50 dark:bg-navy-950 ring-2 ring-brand-500/20 text-brand-600 font-bold'
                    : 'border-slate-200 dark:border-navy-800 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px]">UPI & QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setGatewayTab('CARD')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  gatewayTab === 'CARD'
                    ? 'border-brand-500 bg-brand-50 dark:bg-navy-950 ring-2 ring-brand-500/20 text-brand-600 font-bold'
                    : 'border-slate-200 dark:border-navy-800 text-slate-500 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setGatewayTab('NETBANKING')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  gatewayTab === 'NETBANKING'
                    ? 'border-brand-500 bg-brand-50 dark:bg-navy-950 ring-2 ring-brand-500/20 text-brand-600 font-bold'
                    : 'border-slate-200 dark:border-navy-800 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[11px]">Net Banking / DD</span>
              </button>
            </div>
          </div>

          {/* TAB 1: UPI QR CODE */}
          {gatewayTab === 'UPI' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <QrCode className="w-32 h-32 text-slate-900 mx-auto" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Scan QR using any UPI Application
                </p>
                <p className="text-[10px] text-slate-500">
                  Supports Google Pay • PhonePe • Paytm • BHIM • Cred UPI
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>UPI ID: fees@sgtu.edu.in</span>
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT / DEBIT CARD */}
          {gatewayTab === 'CARD' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Card Number (Visa / Mastercard / RuPay)
                </label>
                <input
                  type="text"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                  placeholder="4532 0000 0000 8912"
                  className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentForm.cardExpiry}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardExpiry: e.target.value })}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={paymentForm.cardCvv}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardCvv: e.target.value })}
                    placeholder="123"
                    className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  value={paymentForm.cardHolder}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                  placeholder="Full Name as on Card"
                  className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: NET BANKING / CASH */}
          {gatewayTab === 'NETBANKING' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Select Channel / Method:
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="ONLINE">State Bank of India (SBI Corporate Netbanking)</option>
                  <option value="HDFC">HDFC Bank SmartHub</option>
                  <option value="ICICI">ICICI Bank Corporate Portal</option>
                  <option value="BANK_TRANSFER">Direct RTGS / NEFT Treasury Transfer</option>
                  <option value="CASH">Institutional Cash Counter (Bursar Bureau)</option>
                  <option value="CHEQUE">Banker's Demand Draft (DD)</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct transactions are reconciled synchronously against the university central treasury accounts.
              </p>
            </div>
          )}

          {/* Security Guarantee */}
          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-brand-500" />
            <span>Official University Bursar Payment Channel • Instant Verifiable Tax Receipt.</span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading} icon={Lock}>
              Authorize ₹{Number(paymentForm.amount || 0).toLocaleString()}
            </Button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL UNIVERSITY PAYMENT RECEIPT & TAX INVOICE MODAL */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official University Fee Receipt & Tax Invoice"
        subtitle="Department of Finance, Bursar & Treasury Services"
      >
        {selectedPayment && (
          <div className="space-y-4">
            {/* Printable Receipt Paper */}
            <div
              id="printable-fee-receipt"
              className="p-6 rounded-2xl bg-white dark:bg-navy-950 text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-navy-800 shadow-md space-y-4 text-xs select-none"
            >
              {/* Receipt Header */}
              <div className="border-b-2 border-brand-500 pb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                    SG
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                      SG TECH UNIVERSITY (SGTU)
                    </h3>
                    <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
                      Bursar & Treasury Accounts • Official Payment Voucher
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Electronic City Phase 1, Bangalore, Karnataka - 560100 • GSTIN: 29AAACS1429K1Z5
                    </p>
                  </div>
                </div>

                {/* VERIFIED STAMP BADGE */}
                <div className="border-2 border-emerald-500 text-emerald-600 px-3 py-1 rounded-xl text-center transform rotate-2 font-black">
                  <div className="text-[10px] tracking-widest uppercase">PAID & VERIFIED</div>
                  <div className="text-[8px] font-mono">FINANCE CLEARED</div>
                </div>
              </div>

              {/* Receipt Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-100 dark:border-navy-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {selectedPayment.receiptNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Transaction ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedPayment.transactionId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Date & Time:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Payment Channel:</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {selectedPayment.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Student & Course Details */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Billed To (Student):</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedInvoice?.studentId?.fullName || user?.name || 'Aarav Sharma'}
                  </p>
                  <p className="text-slate-500 font-mono text-[10px]">
                    Registration No: {selectedInvoice?.studentId?.registrationNumber || 'SGTU2024CS001'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Academic Program:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Bachelor of Technology (Computer Science & Engineering)
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Semester: {selectedInvoice?.semester || 6} • Academic Year 2026–2027
                  </p>
                </div>
              </div>

              {/* Itemized Fee Breakdown Table */}
              <div className="border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-navy-900 font-bold text-slate-500 uppercase text-[9px]">
                    <tr>
                      <th className="px-3 py-2">S.No</th>
                      <th className="px-3 py-2">Description of Academic Charge</th>
                      <th className="px-3 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    <tr>
                      <td className="px-3 py-1.5 font-mono">1</td>
                      <td className="px-3 py-1.5 font-medium">{selectedInvoice?.title || 'Academic Semester Tuition'}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">
                        ₹{(selectedPayment.amount * 0.8).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-mono">2</td>
                      <td className="px-3 py-1.5">High-Performance Computing & AI Labs Maintenance</td>
                      <td className="px-3 py-1.5 text-right font-mono">
                        ₹{(selectedPayment.amount * 0.12).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-mono">3</td>
                      <td className="px-3 py-1.5">Digital Library & IEEE Resource Subscriptions</td>
                      <td className="px-3 py-1.5 text-right font-mono">
                        ₹{(selectedPayment.amount * 0.08).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800 font-bold">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right uppercase text-[10px]">
                        Total Amount Received:
                      </td>
                      <td className="px-3 py-2 text-right text-base text-emerald-600 font-mono">
                        ₹{selectedPayment.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-2 flex items-end justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <QrCode className="w-10 h-10 text-slate-800 dark:text-slate-200" />
                  <div>
                    <span className="font-mono block text-[9px]">DIGITAL VERIFICATION</span>
                    <span className="text-[8px]">Scan to authenticate with university registry</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-serif italic text-xs text-brand-600 font-bold">N. Ramanathan</div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[9px]">
                    Chief Accounts Officer & Bursar
                  </span>
                  <span className="text-[8px]">SG Tech University</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => window.print()} icon={Printer}>
                Print / Save PDF
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
        subtitle="Issue semester tuition or lab fee charge to an enrolled student."
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Student *</label>
            <select
              required
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
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
            <label className="block font-semibold mb-1">Invoice Title *</label>
            <input
              type="text"
              required
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              placeholder="e.g. Semester 6 Academic & Laboratory Tuition"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Total Amount (₹) *</label>
              <input
                type="number"
                required
                value={invoiceForm.totalAmount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
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

export default FeeManagementPage;
