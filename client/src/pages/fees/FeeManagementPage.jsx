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
  X,
  Award,
  Calendar,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  Percent,
  FileCheck,
  AlertTriangle,
  HelpCircle,
  Tag,
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

  // Navigation Sub-Tab: 'invoices' | 'scholarships'
  const [activeTab, setActiveTab] = useState('invoices');

  const [invoices, setInvoices] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState({
    totalGrossBilled: 170000,
    totalScholarshipsGranted: 103000,
    totalNetPayable: 109500,
    totalCollected: 58800,
    totalOutstanding: 50700,
    activeInstallmentPlans: 2,
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reminderLoadingId, setReminderLoadingId] = useState(null);

  // Payment Gateway Tab Selection: 'UPI' | 'CARD' | 'NETBANKING'
  const [gatewayTab, setGatewayTab] = useState('UPI');

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    title: 'Semester 6 Engineering & Lab Tuition',
    grossAmount: 85000,
    scholarshipId: '',
    hasInstallmentPlan: true,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    semester: 6,
  });

  const [scholarshipForm, setScholarshipForm] = useState({
    studentId: '',
    scholarshipName: 'Vice Chancellor Merit Excellence Scholarship (CGPA > 9.0)',
    category: 'MERIT',
    grantType: 'PERCENTAGE',
    concessionValue: 30,
    grossTuitionFee: 85000,
    semester: 6,
    remarks: 'Concession sanctioned for top 2% academic cohort.',
    applyToActiveInvoice: true,
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

  const loadData = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/fees/invoices?status=${statusFilter}` : '/fees/invoices';
      const [invRes, schRes, sumRes] = await Promise.all([
        api.get(url),
        api.get('/fees/scholarships').catch(() => ({ data: { success: false } })),
        api.get('/fees/ledger/summary').catch(() => ({ data: { success: false } })),
      ]);

      if (invRes.data.success) {
        setInvoices(invRes.data.data);
      }
      if (schRes?.data?.success) {
        setScholarships(schRes.data.data);
      }
      if (sumRes?.data?.success && sumRes.data.data) {
        setLedgerSummary(sumRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Handle invoice creation
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/fees/invoices', invoiceForm);
      if (res.data.success) {
        setIsInvoiceModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle scholarship sanction
  const handleSanctionScholarship = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/fees/scholarships', scholarshipForm);
      if (res.data.success) {
        setIsScholarshipModalOpen(false);
        alert('Scholarship concession successfully sanctioned and applied to fee ledger!');
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sanction scholarship.');
    } finally {
      setActionLoading(false);
    }
  };

  // Convert invoice to 3-part installment plan
  const handleSetupInstallments = async (invoiceId) => {
    try {
      const res = await api.post(`/fees/invoices/${invoiceId}/setup-installments`);
      if (res.data.success) {
        alert('3-Part Milestone Installment Schedule activated for this invoice.');
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate installment plan.');
    }
  };

  // Send automated deadline reminder for milestone
  const handleSendReminder = async (invoiceId, instNum) => {
    setReminderLoadingId(`${invoiceId}-${instNum}`);
    try {
      const res = await api.post(`/fees/invoices/${invoiceId}/installments/${instNum}/reminder`);
      if (res.data.success) {
        alert(res.data.message || 'Automated deadline reminder dispatched successfully.');
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send deadline reminder.');
    } finally {
      setReminderLoadingId(null);
    }
  };

  // Pay invoice or milestone
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

      const payload = {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentForm.amount),
        paymentMethod: methodLabel,
      };

      if (selectedMilestone) {
        payload.installmentNumber = selectedMilestone.installmentNumber;
      }

      const res = await api.post('/fees/payments', payload);

      if (res.data.success) {
        setIsPayModalOpen(false);
        // Confetti celebration
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
        });

        setSelectedPayment({
          ...res.data.data.payment,
          invoice: selectedInvoice,
          milestone: selectedMilestone,
        });
        setIsReceiptModalOpen(true);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment transaction failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const openReceiptForInvoice = (inv, milestone = null) => {
    setSelectedInvoice(inv);
    setSelectedMilestone(milestone);
    const lastPayment = (inv.payments && inv.payments[0]) || {
      receiptNumber: milestone?.receiptNumber || `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionId: milestone?.transactionId || `TXN-VERIFIED-${inv.invoiceNumber}`,
      paymentDate: milestone?.paymentDate || new Date(),
      paymentMethod: 'ONLINE NETBANKING / UPI',
      amount: milestone ? milestone.paidAmount || milestone.amount : inv.paidAmount || inv.totalAmount,
    };
    setSelectedPayment({
      ...lastPayment,
      invoice: inv,
      milestone,
    });
    setIsReceiptModalOpen(true);
  };

  // Scholarship category badge
  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'MERIT':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'GOVERNMENT_CASTE':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'SPORTS':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'NEED_BASED_EWS':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-navy-950 dark:text-slate-300 border-slate-200 dark:border-navy-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Invoices, Scholarship Ledger & Installment Plans"
        description="Official institutional fee accounting, Merit/Category scholarship deductions, and 3-part milestone installment payment schedules."
      >
        <div className="flex items-center gap-2">
          {isAdminOrAccountant && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsScholarshipModalOpen(true)}
                icon={Award}
                className="border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                Sanction Scholarship
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsInvoiceModalOpen(true)}
                icon={Plus}
              >
                Generate Fee Invoice
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Semester Invoices & Milestone Plans ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scholarships')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'scholarships'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Scholarship & Concession Ledger ({scholarships.length})</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Billed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Gross Tuition Billed</span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-950 text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">
            ₹{ledgerSummary.totalGrossBilled.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Pre-scholarship university billing</p>
        </div>

        {/* Scholarships Granted */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 dark:from-navy-900 dark:to-purple-950/30 border border-purple-200 dark:border-purple-900/50 shadow-soft">
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 mb-1 font-semibold">
            <span>Scholarships Deducted</span>
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono">
            -₹{ledgerSummary.totalScholarshipsGranted.toLocaleString()}
          </h3>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 font-medium">
            Merit, Caste & Sports Concessions
          </p>
        </div>

        {/* Cleared & Deposited */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cleared & Deposited</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{ledgerSummary.totalCollected.toLocaleString()}
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
            Verified treasury collection
          </p>
        </div>

        {/* Pending Balance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pending Balance</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
            ₹{ledgerSummary.totalOutstanding.toLocaleString()}
          </h3>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">
            {ledgerSummary.activeInstallmentPlans} Active Installment Schedules
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SEMESTER INVOICES & 3-PART MILESTONE PLANS */}
      {/* ========================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-500" />
                  <span>Semester Invoices & 3-Part Installment Schedules</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Click on an invoice to view its 40% - 30% - 30% milestone schedule, overdue alerts, and direct milestone payments.
                </p>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-2.5 py-1.5 font-bold"
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
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {invoices.map((inv) => {
                  const isExpanded = expandedInvoiceId === inv._id;
                  const hasScholarship = Boolean(inv.scholarshipDiscount && inv.scholarshipDiscount > 0);

                  return (
                    <div key={inv._id} className="transition-all hover:bg-slate-50/40 dark:hover:bg-navy-800/30">
                      {/* Main Invoice Row */}
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => setExpandedInvoiceId(isExpanded ? null : inv._id)}
                            className="mt-1 p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-navy-800"
                            title="Toggle Milestone Details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400">
                                {inv.invoiceNumber}
                              </span>
                              <StatusBadge status={inv.status} />
                              {inv.hasInstallmentPlan && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  3-Part Installments Active
                                </span>
                              )}
                              {hasScholarship && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                  <Percent className="w-3 h-3" />
                                  ₹{inv.scholarshipDiscount.toLocaleString()} Concession
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                              {inv.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {isAdminOrAccountant && (
                                <span>
                                  Student: <strong className="text-slate-700 dark:text-slate-200">{inv.studentId?.fullName}</strong> ({inv.studentId?.registrationNumber})
                                </span>
                              )}
                              <span>Semester: {inv.semester}</span>
                              <span>Due Date: {new Date(inv.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-5">
                          <div className="text-right">
                            {hasScholarship && (
                              <div className="text-[11px] text-slate-400 line-through">
                                Gross: ₹{(inv.grossAmount || (inv.totalAmount + inv.scholarshipDiscount)).toLocaleString()}
                              </div>
                            )}
                            <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
                              Net: ₹{inv.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                              Paid: ₹{inv.paidAmount.toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {inv.status !== 'PAID' ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setSelectedMilestone(null);
                                  setPaymentForm({
                                    ...paymentForm,
                                    amount: String(inv.totalAmount - inv.paidAmount),
                                    cardHolder: inv.studentId?.fullName || user?.name || '',
                                  });
                                  setIsPayModalOpen(true);
                                }}
                              >
                                {isAdminOrAccountant ? 'Record Payment' : 'Pay Full Balance'}
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

                            {!inv.hasInstallmentPlan && inv.status !== 'PAID' && isAdminOrAccountant && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSetupInstallments(inv._id)}
                                icon={Layers}
                                className="text-[11px]"
                              >
                                Split Installments
                              </Button>
                            )}

                            {inv.paidAmount > 0 && inv.status !== 'PAID' && (
                              <button
                                type="button"
                                onClick={() => openReceiptForInvoice(inv)}
                                title="View Last Partial Payment Receipt"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expandable 3-Part Milestone Schedule Panel */}
                      {isExpanded && (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-navy-950/70 border-t border-slate-100 dark:border-navy-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-brand-600" />
                              3-Part Milestone Installment Schedule (40% - 30% - 30%)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Automated statutory milestones with semester clearance gates
                            </span>
                          </div>

                          {inv.hasInstallmentPlan && inv.installments?.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {inv.installments.map((inst) => {
                                const isMilestonePaid = inst.status === 'PAID';
                                const isOverdue = inst.status === 'OVERDUE';

                                return (
                                  <div
                                    key={inst.installmentNumber}
                                    className={`p-3.5 rounded-xl border transition-all ${
                                      isMilestonePaid
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                                        : isOverdue
                                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
                                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 font-mono">
                                        Part {inst.installmentNumber} ({inst.percentage}%)
                                      </span>
                                      <span
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          isMilestonePaid
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                            : isOverdue
                                            ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300'
                                            : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                        }`}
                                      >
                                        {inst.status}
                                      </span>
                                    </div>

                                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight mt-1 mb-2">
                                      {inst.milestoneTitle}
                                    </div>

                                    <div className="flex items-baseline justify-between mb-2">
                                      <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                                        ₹{inst.amount.toLocaleString()}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        Due: {new Date(inst.dueDate).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 dark:border-navy-800/60 flex items-center justify-between gap-2">
                                      {!isMilestonePaid ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedInvoice(inv);
                                              setSelectedMilestone(inst);
                                              setPaymentForm({
                                                ...paymentForm,
                                                amount: String(inst.amount - (inst.paidAmount || 0)),
                                                cardHolder: inv.studentId?.fullName || user?.name || '',
                                              });
                                              setIsPayModalOpen(true);
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-[10px] shadow-sm transition-all flex items-center gap-1"
                                          >
                                            <CreditCard className="w-3 h-3" />
                                            <span>Pay Part {inst.installmentNumber}</span>
                                          </button>

                                          {isAdminOrAccountant && (
                                            <button
                                              type="button"
                                              disabled={reminderLoadingId === `${inv._id}-${inst.installmentNumber}`}
                                              onClick={() => handleSendReminder(inv._id, inst.installmentNumber)}
                                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:text-brand-600 text-[10px] font-bold border border-slate-200 dark:border-navy-800 flex items-center gap-1"
                                              title="Send automated SMS / Email reminder to student and parent"
                                            >
                                              <Send className="w-2.5 h-2.5" />
                                              <span>{inst.reminderSent ? 'Reminded' : 'Send Reminder'}</span>
                                            </button>
                                          )}
                                        </>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => openReceiptForInvoice(inv, inst)}
                                          className="text-[10px] text-emerald-700 dark:text-emerald-300 hover:underline font-bold flex items-center gap-1"
                                        >
                                          <Receipt className="w-3 h-3" />
                                          <span>Receipt: {inst.receiptNumber}</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-3 text-center text-xs text-slate-400 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                              <span>No installment plan generated for this invoice. </span>
                              {isAdminOrAccountant && (
                                <button
                                  type="button"
                                  onClick={() => handleSetupInstallments(inv._id)}
                                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline ml-1"
                                >
                                  Activate 3-Part Installment Schedule Now
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MERIT & CATEGORY SCHOLARSHIP LEDGER */}
      {/* ========================================================= */}
      {activeTab === 'scholarships' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 inline-block">
                Statutory Financial Aid & Merit Concessions
              </span>
              <h3 className="text-lg font-black tracking-tight text-white">
                Institutional & Government Scholarship Ledger
              </h3>
              <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
                Automated tuition deductions calculated against Gross Semester Fees for Academic CGPA Merit, State Caste Post-Matric Welfare, Sports Quotas, and Need-Based EWS Concessions.
              </p>
            </div>

            {isAdminOrAccountant && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsScholarshipModalOpen(true)}
                icon={Plus}
                className="bg-white text-purple-800 hover:bg-purple-50 font-bold"
              >
                Sanction Scholarship
              </Button>
            )}
          </div>

          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Sanctioned Scholarship Awards Register</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {scholarships.length} Awards Logged
              </span>
            </div>

            {scholarships.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No scholarships on record.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {scholarships.map((sch) => (
                  <div key={sch._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-navy-800/30 transition-all">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(sch.category)}`}>
                          {sch.category}
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                          {sch.sanctionOrderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {sch.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {sch.scholarshipName}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Beneficiary: <strong className="text-slate-700 dark:text-slate-200">{sch.studentId?.fullName}</strong> ({sch.studentId?.registrationNumber})
                        </span>
                        <span>Academic Year: {sch.academicYear}</span>
                        <span>Semester: {sch.semester}</span>
                        <span>Authority: {sch.sanctionedBy}</span>
                      </div>

                      {sch.remarks && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{sch.remarks}"
                        </p>
                      )}
                    </div>

                    <div className="text-right p-3 rounded-xl bg-purple-50/50 dark:bg-navy-950 border border-purple-100 dark:border-navy-800 min-w-[200px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Concession Awarded
                      </span>
                      <div className="text-lg font-mono font-black text-purple-700 dark:text-purple-300">
                        {sch.grantType === 'PERCENTAGE' ? `${sch.concessionValue}% Tuition Waiver` : `₹${sch.concessionValue.toLocaleString()} Fixed Subsidy`}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                        Deduction: <strong className="text-emerald-600 dark:text-emerald-400">-₹{sch.deductionAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SANCTION / APPLY SCHOLARSHIP */}
      {/* ========================================================= */}
      <Modal
        isOpen={isScholarshipModalOpen}
        onClose={() => setIsScholarshipModalOpen(false)}
        title="Sanction Institutional / Government Scholarship"
        subtitle="Auto-calculate fee concession and apply directly to student invoice."
      >
        <form onSubmit={handleSanctionScholarship} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Student Beneficiary *</label>
            <select
              required
              value={scholarshipForm.studentId}
              onChange={(e) => setScholarshipForm({ ...scholarshipForm, studentId: e.target.value })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Scholarship Category *</label>
              <select
                value={scholarshipForm.category}
                onChange={(e) => setScholarshipForm({ ...scholarshipForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="MERIT">Academic Merit (CGPA &gt; 9.0)</option>
                <option value="GOVERNMENT_CASTE">State Welfare (SC/ST/OBC Post-Matric)</option>
                <option value="SPORTS">National / State Sports Quota</option>
                <option value="NEED_BASED_EWS">Economically Weaker Section (EWS)</option>
                <option value="INSTITUTIONAL_ALUMNI">SGTU Sibling / Alumni Fellowship</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Concession Type *</label>
              <select
                value={scholarshipForm.grantType}
                onChange={(e) => setScholarshipForm({ ...scholarshipForm, grantType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="PERCENTAGE">Percentage (%) of Tuition</option>
                <option value="FIXED_AMOUNT">Fixed Currency Subsidy (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Scholarship Title / Sanction Scheme *</label>
            <input
              type="text"
              required
              value={scholarshipForm.scholarshipName}
              onChange={(e) => setScholarshipForm({ ...scholarshipForm, scholarshipName: e.target.value })}
              placeholder="e.g. Vice Chancellor Merit Excellence Concession"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">
                {scholarshipForm.grantType === 'PERCENTAGE' ? 'Concession Percentage (%) *' : 'Fixed Subsidy Amount (₹) *'}
              </label>
              <input
                type="number"
                min="1"
                max={scholarshipForm.grantType === 'PERCENTAGE' ? 100 : 200000}
                required
                value={scholarshipForm.concessionValue}
                onChange={(e) => setScholarshipForm({ ...scholarshipForm, concessionValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-bold font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Gross Semester Tuition (₹) *</label>
              <input
                type="number"
                required
                value={scholarshipForm.grossTuitionFee}
                onChange={(e) => setScholarshipForm({ ...scholarshipForm, grossTuitionFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Real-time Calculation Ledger Preview */}
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 space-y-1">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
              Real-Time Ledger Deduction Preview
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Gross Tuition:</span>
              <span className="font-mono font-bold">₹{scholarshipForm.grossTuitionFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-bold">
              <span>Auto-Deduction:</span>
              <span className="font-mono">
                -₹{
                  scholarshipForm.grantType === 'PERCENTAGE'
                    ? Math.round((scholarshipForm.grossTuitionFee * scholarshipForm.concessionValue) / 100).toLocaleString()
                    : scholarshipForm.concessionValue.toLocaleString()
                }
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-purple-200 dark:border-purple-900">
              <span className="text-slate-900 dark:text-white">Net Payable Fee:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                ₹{
                  Math.max(
                    0,
                    scholarshipForm.grossTuitionFee -
                      (scholarshipForm.grantType === 'PERCENTAGE'
                        ? Math.round((scholarshipForm.grossTuitionFee * scholarshipForm.concessionValue) / 100)
                        : scholarshipForm.concessionValue)
                  ).toLocaleString()
                }
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Remarks & Academic Council Minutes</label>
            <textarea
              rows={2}
              value={scholarshipForm.remarks}
              onChange={(e) => setScholarshipForm({ ...scholarshipForm, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="applyInvoiceCheck"
              checked={scholarshipForm.applyToActiveInvoice}
              onChange={(e) => setScholarshipForm({ ...scholarshipForm, applyToActiveInvoice: e.target.checked })}
              className="rounded text-purple-600"
            />
            <label htmlFor="applyInvoiceCheck" className="text-slate-700 dark:text-slate-300 font-medium">
              Automatically apply discount to student's active semester invoice
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsScholarshipModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading} className="bg-purple-600 hover:bg-purple-700">
              Sanction & Disburse Concession
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: GENERATE FEE INVOICE WITH INSTALLMENT OPTION */}
      {/* ========================================================= */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Semester Fee Invoice"
        subtitle="Issue academic tuition bill with optional 3-part installment schedule."
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
            <label className="block font-semibold mb-1">Invoice Description *</label>
            <input
              type="text"
              required
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Gross Tuition Fee (₹) *</label>
              <input
                type="number"
                required
                value={invoiceForm.grossAmount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, grossAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">First Due Date *</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          {/* Toggle for 3-part installment plan */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="installmentToggle"
                checked={invoiceForm.hasInstallmentPlan}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, hasInstallmentPlan: e.target.checked })}
                className="rounded text-blue-600"
              />
              <label htmlFor="installmentToggle" className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Split into 3-Part Milestone Installments (40% - 30% - 30%)</span>
              </label>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-300">
              Enables student to pay in 3 milestones: 40% at enrollment, 30% before mid-terms, and 30% before final exams.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Issue Fee Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: PAYMENT GATEWAY (FULL OR MILESTONE SPECIFIC) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="SGTU Secure Financial Payment Gateway"
        subtitle={`Invoice Ref: ${selectedInvoice?.invoiceNumber} • ${selectedMilestone ? selectedMilestone.milestoneTitle : selectedInvoice?.title}`}
      >
        <form onSubmit={handlePayInvoice} className="space-y-4">
          {/* Milestone Banner if paying installment */}
          {selectedMilestone && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
              <div>
                <span className="font-bold block text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Paying Milestone {selectedMilestone.installmentNumber} of 3
                </span>
                <span>{selectedMilestone.milestoneTitle}</span>
              </div>
              <span className="font-mono font-bold text-sm">
                ₹{selectedMilestone.amount.toLocaleString()}
              </span>
            </div>
          )}

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
                <span>UPI ID: accounts@sgtu.edu.in</span>
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

      {/* ========================================================= */}
      {/* MODAL 4: OFFICIAL UNIVERSITY PAYMENT RECEIPT & TAX INVOICE */}
      {/* ========================================================= */}
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
                    Semester: {selectedInvoice?.semester || 6} • Academic Year 2025–2026
                  </p>
                </div>
              </div>

              {/* Itemized Fee Breakdown Table with Scholarship & Installment info */}
              <div className="border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-navy-900 font-bold text-slate-500 uppercase text-[9px]">
                    <tr>
                      <th className="px-3 py-2">S.No</th>
                      <th className="px-3 py-2">Description of Academic Charge / Concession</th>
                      <th className="px-3 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    <tr>
                      <td className="px-3 py-1.5 font-mono">1</td>
                      <td className="px-3 py-1.5 font-medium">
                        Gross Semester Academic & Lab Tuition
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono">
                        ₹{(selectedInvoice?.grossAmount || (selectedInvoice?.totalAmount + (selectedInvoice?.scholarshipDiscount || 0)) || 85000).toLocaleString()}
                      </td>
                    </tr>

                    {/* Scholarship Concession Row if present */}
                    {selectedInvoice?.scholarshipDiscount > 0 && (
                      <tr className="bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300">
                        <td className="px-3 py-1.5 font-mono">2</td>
                        <td className="px-3 py-1.5 font-medium">
                          Scholarship Concession: {selectedInvoice?.scholarshipName || 'Sanctioned Institutional Aid'}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold">
                          -₹{selectedInvoice.scholarshipDiscount.toLocaleString()}
                        </td>
                      </tr>
                    )}

                    {/* Milestone Installment Note if paid per milestone */}
                    {selectedPayment?.installmentNumber && (
                      <tr className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                        <td className="px-3 py-1.5 font-mono">3</td>
                        <td className="px-3 py-1.5 font-medium">
                          3-Part Milestone Payment: Installment Part {selectedPayment.installmentNumber} of 3
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold">
                          ₹{selectedPayment.amount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800 font-bold">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right uppercase text-[10px]">
                        Amount Received This Voucher:
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
    </div>
  );
};

export default FeeManagementPage;
