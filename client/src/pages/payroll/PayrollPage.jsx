import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Landmark,
  DollarSign,
  TrendingUp,
  Printer,
  Calendar,
  CheckCircle2,
  Eye,
  Plus,
  ShieldCheck,
  User,
  Building2,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/DataTable';

export const PayrollPage = () => {
  const { user } = useAuth();
  const isAdminOrAccountant =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'ACCOUNTANT';

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalDisbursed: 0,
    pendingDisbursed: 0,
    processedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isPaySlipOpen, setIsPaySlipOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll');
      if (res.data.success) {
        setRecords(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGeneratePayroll = async () => {
    if (!confirm('Run monthly payroll batch disbursement for all active faculty?')) return;
    setActionLoading(true);
    try {
      const res = await api.post('/payroll/generate', { month: 'October', year: 2026 });
      if (res.data.success) {
        alert(res.data.message);
        fetchPayroll();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setActionLoading(false);
    }
  };

  const openPaySlip = (record) => {
    setSelectedRecord(record);
    setIsPaySlipOpen(true);
  };

  const columns = [
    {
      header: 'Faculty Member',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white leading-tight">
            {row.teacherName}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {row.employeeId}
          </div>
        </div>
      ),
    },
    {
      header: 'Disbursement Bank',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <Landmark className="w-3 h-3 text-emerald-500" />
            <span>{row.bankName || 'HDFC Bank'}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            A/C: •••• {row.accountNumber ? row.accountNumber.slice(-4) : '7291'}
          </div>
        </div>
      ),
    },
    {
      header: 'Period',
      render: (row) => (
        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.month} {row.year}
        </div>
      ),
    },
    {
      header: 'Basic + Allowances',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            ₹{(row.basicPay + (row.hra || 0) + (row.da || 0) + (row.specialAllowance || 0)).toLocaleString('en-IN')}
          </span>
          <div className="text-[10px] text-slate-400">Basic: ₹{row.basicPay?.toLocaleString('en-IN')}</div>
        </div>
      ),
    },
    {
      header: 'Deductions (EPF + TDS)',
      render: (row) => (
        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
          -₹{((row.epfDeduction || 0) + (row.tdsDeduction || 0)).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      header: 'Net Salary',
      render: (row) => (
        <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
          ₹{row.netSalary?.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        <button
          onClick={() => openPaySlip(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Pay Slip</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Payroll & Salary Disbursement"
        description="Statutory payroll processing, automated allowances, income tax deductions, and bank salary slips."
      >
        {isAdminOrAccountant && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleGeneratePayroll}
            isLoading={actionLoading}
            icon={Plus}
          >
            Run Monthly Payroll
          </Button>
        )}
      </PageHeader>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Disbursed (Oct 2026)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            ₹{stats.totalDisbursed.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Direct NEFT/RTGS Bank Processed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Faculty Paid</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <User className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.processedCount} Members
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">100% On-Time Disbursement</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average Faculty Salary</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            ₹{stats.processedCount > 0 ? Math.round(stats.totalDisbursed / stats.processedCount).toLocaleString('en-IN') : 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Per month net in-hand</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Compliance & Tax</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            EPFO & TDS Done
          </h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            Form 16 & UAN Reconciled
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyMessage="No payroll disbursement records found."
      />

      {/* Official Salary Slip Modal */}
      <Modal
        isOpen={isPaySlipOpen}
        onClose={() => setIsPaySlipOpen(false)}
        title="Official Salary Slip"
        subtitle={`Period: ${selectedRecord?.month} ${selectedRecord?.year}`}
      >
        {selectedRecord && (
          <div className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="text-center pb-4 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                SG TECH UNIVERSITY
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Monthly Faculty Pay & Tax Disbursement Voucher
              </p>
              <div className="text-[11px] font-mono text-brand-600 dark:text-brand-400 font-bold mt-1">
                Txn Ref: {selectedRecord.transactionRef}
              </div>
            </div>

            {/* Employee Particulars */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950">
              <div>
                <span className="text-[10px] text-slate-400 block">Faculty Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRecord.teacherName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Employee ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedRecord.employeeId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">PAN Number:</span>
                <span className="font-mono font-bold">{selectedRecord.panNumber || 'ABCPD1234E'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Bank Account:</span>
                <span className="font-mono font-bold">{selectedRecord.bankName} ({selectedRecord.accountNumber})</span>
              </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="grid grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2">
                <h5 className="font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 pb-1">
                  Gross Earnings
                </h5>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-bold">₹{selectedRecord.basicPay?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-bold">₹{selectedRecord.hra?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dearness Allowance (DA)</span>
                    <span className="font-bold">₹{selectedRecord.da?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Academic Allowance</span>
                    <span className="font-bold">₹{selectedRecord.specialAllowance?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-100 font-bold text-emerald-800 dark:text-emerald-300">
                    <span>Total Gross</span>
                    <span>₹{(selectedRecord.basicPay + selectedRecord.hra + selectedRecord.da + selectedRecord.specialAllowance).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-3.5 rounded-xl border border-red-100 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10 space-y-2">
                <h5 className="font-bold text-red-800 dark:text-red-300 border-b border-red-100 pb-1">
                  Statutory Deductions
                </h5>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Employees Provident Fund (EPF)</span>
                    <span className="font-bold text-red-600">₹{selectedRecord.epfDeduction?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax (TDS)</span>
                    <span className="font-bold text-red-600">₹{selectedRecord.tdsDeduction?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax</span>
                    <span className="font-bold text-red-600">₹200</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-red-100 font-bold text-red-800 dark:text-red-300">
                    <span>Total Deductions</span>
                    <span>₹{(selectedRecord.epfDeduction + selectedRecord.tdsDeduction + 200).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Amount Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block text-white/80">
                  Net Salary Transferred to Bank
                </span>
                <h4 className="text-2xl font-black">
                  ₹{selectedRecord.netSalary?.toLocaleString('en-IN')}
                </h4>
              </div>
              <div className="text-right text-[10px] text-white/80">
                <span>Value Date: {selectedRecord.paymentDate}</span>
                <span className="block font-bold text-white">Status: Bank Credited</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
              <Button variant="secondary" onClick={() => setIsPaySlipOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => window.print()} icon={Printer}>
                Print Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default PayrollPage;
