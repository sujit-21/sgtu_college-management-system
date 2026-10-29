import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Calendar,
  MessageSquare,
  Search,
  Copy,
  Check,
  ExternalLink,
  Lock,
  EyeOff,
  ChevronRight,
  History,
  FileCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/DataTable';

export const LeaveGrievancePage = () => {
  const { user } = useAuth();
  const isAdminOrTeacher =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Navigation tab: 'leaves' | 'anti-ragging' | 'grievances'
  const [activeTab, setActiveTab] = useState('leaves');

  // Core Data
  const [leaves, setLeaves] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [quota, setQuota] = useState({
    casualLeave: { total: 8, used: 2, remaining: 6, code: 'CL', title: 'Casual Leave' },
    medicalLeave: { total: 10, used: 3, remaining: 7, code: 'ML', title: 'Medical / Sick Leave' },
    onDutyLeave: { total: 6, used: 1, remaining: 5, code: 'OD', title: 'On-Duty Permissions' },
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [isWhistleblowerModalOpen, setIsWhistleblowerModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedAuditLeave, setSelectedAuditLeave] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewLeave, setSelectedReviewLeave] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Anonymous Tracking State
  const [generatedHashModalOpen, setGeneratedHashModalOpen] = useState(false);
  const [newGeneratedHash, setNewGeneratedHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [trackingSearchHash, setTrackingSearchHash] = useState('AR-7F3A-881C');
  const [trackedCase, setTrackedCase] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Forms
  const [leaveForm, setLeaveForm] = useState({
    applicantName: user?.email?.split('@')[0] || 'Arjun Kumar',
    applicantRole: user?.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
    leaveType: 'Casual Leave (CL)',
    startDate: '',
    endDate: '',
    totalDays: 1,
    reason: '',
    documentProofUrl: '',
  });

  const [whistleblowerForm, setWhistleblowerForm] = useState({
    subject: '',
    description: '',
    incidentLocation: 'Hostel Block B, 3rd Floor Stairwell',
    incidentDate: new Date().toISOString().split('T')[0],
    evidenceUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80',
    category: 'Anti-Ragging / Security',
    priority: 'URGENT',
  });

  const [grievanceForm, setGrievanceForm] = useState({
    category: 'Campus Infrastructure',
    subject: '',
    description: '',
    priority: 'MEDIUM',
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, grievancesRes, quotaRes] = await Promise.all([
        api.get('/leave-grievance/leaves'),
        api.get('/leave-grievance/grievances'),
        api.get('/leave-grievance/quota').catch(() => ({ data: { success: false } })),
      ]);
      if (leavesRes.data.success) setLeaves(leavesRes.data.data);
      if (grievancesRes.data.success) setGrievances(grievancesRes.data.data);
      if (quotaRes?.data?.success && quotaRes.data.data) {
        setQuota(quotaRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Track anonymous case
  const handleTrackCase = async (hashToSearch) => {
    const hash = (hashToSearch || trackingSearchHash).trim();
    if (!hash) return;
    setTrackingLoading(true);
    setTrackingError('');
    try {
      const res = await api.get(`/leave-grievance/anti-ragging/${hash}`);
      if (res.data.success) {
        setTrackedCase(res.data.data);
      } else {
        setTrackedCase(null);
        setTrackingError(res.data.message || 'Case not found');
      }
    } catch (err) {
      setTrackedCase(null);
      setTrackingError(err.response?.data?.message || 'No case found matching this tracking hash.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Submit anonymous whistleblower complaint
  const handleWhistleblowerSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/leave-grievance/anti-ragging', whistleblowerForm);
      if (res.data.success && res.data.data) {
        setIsWhistleblowerModalOpen(false);
        const secretCode = res.data.data.trackingHash;
        setNewGeneratedHash(secretCode);
        setGeneratedHashModalOpen(true);
        setTrackingSearchHash(secretCode);
        handleTrackCase(secretCode);
        setWhistleblowerForm({
          subject: '',
          description: '',
          incidentLocation: 'Hostel Block B, 3rd Floor Stairwell',
          incidentDate: new Date().toISOString().split('T')[0],
          evidenceUrl: '',
          category: 'Anti-Ragging / Security',
          priority: 'URGENT',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to lodge anonymous report.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit leave application
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/leave-grievance/leaves', leaveForm);
      if (res.data.success) {
        setIsLeaveModalOpen(false);
        setLeaveForm({
          applicantName: user?.email?.split('@')[0] || 'Student',
          applicantRole: user?.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
          leaveType: 'Casual Leave (CL)',
          startDate: '',
          endDate: '',
          totalDays: 1,
          reason: '',
          documentProofUrl: '',
        });
        alert('Leave application submitted for Tier-1 Proctor review.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for leave.');
    } finally {
      setActionLoading(false);
    }
  };

  // Tier review action
  const handleTierReview = async (action) => {
    if (!selectedReviewLeave) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/leave-grievance/leaves/${selectedReviewLeave._id}/tier-review`, {
        action,
        remarks: reviewRemarks || (action === 'APPROVE' ? 'Approved & validated.' : 'Rejected during tier review.'),
      });
      if (res.data.success) {
        setIsReviewModalOpen(false);
        setSelectedReviewLeave(null);
        setReviewRemarks('');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review decision.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit regular grievance
  const handleLodgeGrievance = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/leave-grievance/grievances', {
        ...grievanceForm,
        submittedByName: user?.email?.split('@')[0] || 'Student',
      });
      if (res.data.success) {
        setIsGrievanceModalOpen(false);
        setGrievanceForm({
          category: 'Campus Infrastructure',
          subject: '',
          description: '',
          priority: 'MEDIUM',
        });
        alert('Campus grievance ticket lodged successfully.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to lodge grievance.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Leave Table Columns
  const leaveColumns = [
    {
      header: 'Applicant & Role',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white leading-tight">
            {row.applicantName}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-500">
              {row.applicantRole}
            </span>
            {row.collegeId && (
              <span className="text-[10px] text-slate-400 font-mono">
                {row.collegeId}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type & Quota',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
            {row.leaveType}
          </span>
          {row.documentProofUrl && (
            <a
              href={row.documentProofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-brand-600 dark:text-brand-400 hover:underline mt-0.5"
            >
              <FileCheck className="w-3 h-3" />
              <span>Document Proof</span>
            </a>
          )}
        </div>
      ),
    },
    {
      header: 'Duration',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            {row.totalDays} Day{row.totalDays > 1 ? 's' : ''}
          </span>
          <div className="text-[10px] text-slate-400 font-mono">
            {row.startDate} to {row.endDate}
          </div>
        </div>
      ),
    },
    {
      header: 'Hierarchical Chain Progress',
      render: (row) => {
        const isApproved = row.status === 'APPROVED';
        const isRejected = row.status === 'REJECTED';
        const currentTier = row.approvalTier || 'SUBMITTED';

        const step1Done = true; // submitted
        const step2Done = isApproved || currentTier === 'PROCTOR_APPROVED' || currentTier === 'HOD_APPROVED' || currentTier === 'DEAN_APPROVED';
        const step3Done = isApproved || currentTier === 'HOD_APPROVED' || currentTier === 'DEAN_APPROVED';
        const step4Done = isApproved || currentTier === 'DEAN_APPROVED';

        return (
          <div className="space-y-1.5 min-w-[200px]">
            {/* Visual Multi-Tier Stepper */}
            <div className="flex items-center gap-1 text-[10px] font-semibold">
              <span className={`px-1.5 py-0.5 rounded ${step1Done ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                1. Student
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className={`px-1.5 py-0.5 rounded ${
                step2Done
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : currentTier === 'SUBMITTED' && !isRejected
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                  : isRejected
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-slate-100 text-slate-400 dark:bg-navy-950'
              }`}>
                2. Proctor
              </span>
              {row.requiredTiers >= 2 && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className={`px-1.5 py-0.5 rounded ${
                    step3Done
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : currentTier === 'PROCTOR_APPROVED' && !isRejected
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                      : 'bg-slate-100 text-slate-400 dark:bg-navy-950'
                  }`}>
                    3. HOD
                  </span>
                </>
              )}
              {row.requiredTiers >= 3 && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className={`px-1.5 py-0.5 rounded ${
                    step4Done
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : currentTier === 'HOD_APPROVED' && !isRejected
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                      : 'bg-slate-100 text-slate-400 dark:bg-navy-950'
                  }`}>
                    4. Dean
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Stage: <strong className="text-slate-700 dark:text-slate-200">{row.currentStage || 'Faculty Review'}</strong>
              </span>
              <button
                onClick={() => {
                  setSelectedAuditLeave(row);
                  setIsAuditModalOpen(true);
                }}
                className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5 font-bold"
              >
                <History className="w-3 h-3" />
                <span>Audit</span>
              </button>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status & Approver',
      render: (row) => (
        <div>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              row.status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : row.status === 'REJECTED'
                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {row.status}
          </span>
          {row.approvedBy && (
            <span className="text-[9px] text-slate-400 block mt-0.5 truncate max-w-[150px]">
              {row.approvedBy}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Review Actions',
      className: 'text-right',
      render: (row) => {
        if (!isAdminOrTeacher || row.status !== 'PENDING') return null;

        let actionTitle = 'Review Tier';
        if (row.approvalTier === 'SUBMITTED') actionTitle = 'Proctor Endorse';
        else if (row.approvalTier === 'PROCTOR_APPROVED') actionTitle = 'HOD Endorse';
        else if (row.approvalTier === 'HOD_APPROVED') actionTitle = 'Dean Sign-Off';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedReviewLeave(row);
                setReviewRemarks('');
                setIsReviewModalOpen(true);
              }}
              className="text-[11px] h-7 px-2.5 font-bold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/50"
            >
              {actionTitle}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Ledger, Multi-Tier Approvals & Anti-Ragging Portal"
        description="Official institutional student & faculty leave quota ledger, multi-tier hierarchical workflow, and zero-knowledge anonymous whistleblower protection."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsWhistleblowerModalOpen(true)}
            icon={ShieldAlert}
            className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20"
          >
            Anonymous Whistleblower Box
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsLeaveModalOpen(true)}
            icon={Plus}
          >
            Apply for Leave
          </Button>
        </div>
      </PageHeader>

      {/* Main Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'leaves'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Leave Applications & Quota ({leaves.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('anti-ragging');
            if (!trackedCase) handleTrackCase('AR-7F3A-881C');
          }}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'anti-ragging'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Anonymous Anti-Ragging Whistleblower</span>
        </button>

        <button
          onClick={() => setActiveTab('grievances')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'grievances'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Campus Grievance Tickets ({grievances.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LEAVE APPLICATIONS & QUOTA LEDGER */}
      {/* ========================================================= */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Real-time Leave Balance Quota Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Real-Time Leave Balance Quota Ledger</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    AY 2025–2026
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time statutory balance tracking for Casual, Medical, and On-Duty institutional permissions.
                </p>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Auto-deducted upon Multi-Tier Final Sign-off
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Casual Leave Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-navy-900 dark:to-navy-950 border border-blue-200 dark:border-navy-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    CL — Casual Leave
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                    {quota.casualLeave.remaining} Days Remaining
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {quota.casualLeave.remaining}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / {quota.casualLeave.total} total days allowed
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-blue-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden mb-1">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(quota.casualLeave.used / quota.casualLeave.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{quota.casualLeave.used} Days Consumed</span>
                  <span>{Math.round((quota.casualLeave.remaining / quota.casualLeave.total) * 100)}% Available</span>
                </div>
              </div>

              {/* Medical Leave Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-navy-900 dark:to-navy-950 border border-emerald-200 dark:border-navy-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ML — Medical / Sick Leave
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {quota.medicalLeave.remaining} Days Remaining
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {quota.medicalLeave.remaining}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / {quota.medicalLeave.total} total days allowed
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-emerald-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden mb-1">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(quota.medicalLeave.used / quota.medicalLeave.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{quota.medicalLeave.used} Days Consumed (Certificate req.)</span>
                  <span>{Math.round((quota.medicalLeave.remaining / quota.medicalLeave.total) * 100)}% Available</span>
                </div>
              </div>

              {/* On-Duty Permission Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/40 dark:from-navy-900 dark:to-navy-950 border border-purple-200 dark:border-navy-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    OD — On-Duty Permissions
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">
                    {quota.onDutyLeave.remaining} Days Remaining
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {quota.onDutyLeave.remaining}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / {quota.onDutyLeave.total} total days allowed
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-purple-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden mb-1">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(quota.onDutyLeave.used / quota.onDutyLeave.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{quota.onDutyLeave.used} Days Used (Hackathons/Conferences)</span>
                  <span>{Math.round((quota.onDutyLeave.remaining / quota.onDutyLeave.total) * 100)}% Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hierarchical Workflow Formula Banner */}
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-navy-800 dark:text-brand-400 flex items-center justify-center font-bold">
                §
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Multi-Tier Hierarchical Approval Chain
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono">
                  <span className="font-bold text-slate-800 dark:text-white">Student Request</span>
                  <span className="text-slate-400">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Proctor / Class Teacher
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    HOD
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Dean of Student Welfare
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right sm:max-w-xs">
              <strong className="text-slate-700 dark:text-slate-200">Hierarchy Rules:</strong> 1–2 days (Proctor final), 3–5 days (+HOD), &gt;5 days (+Dean of Student Welfare).
            </div>
          </div>

          {/* Applications Table */}
          <DataTable
            columns={leaveColumns}
            data={leaves}
            loading={loading}
            emptyMessage="No leave applications on record."
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ANONYMOUS ANTI-RAGGING & HARASSMENT WHISTLEBLOWER */}
      {/* ========================================================= */}
      {activeTab === 'anti-ragging' && (
        <div className="space-y-6">
          {/* Whistleblower Guarantee Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-amber-700 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase border border-white/30 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Zero-Knowledge Encrypted Portal
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/20 text-[11px] font-mono border border-white/20">
                  UGC Anti-Ragging Mandate 2009
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                Anonymous Anti-Ragging & Harassment Whistleblower Box
              </h2>

              <p className="text-xs sm:text-sm text-red-100 max-w-3xl leading-relaxed">
                Submit urgent ragging, physical intimidation, or harassment grievances with photographic evidence. Your identity, IP address, and student ID are <strong>NEVER</strong> recorded. You will receive a unique cryptographic tracking hash to follow the Chief Proctor and Flying Squad disciplinary actions in real time.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsWhistleblowerModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Submit Urgent Anonymous Whistleblower Complaint</span>
                </button>
                <div className="text-[11px] text-red-200 flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Zero identity trace guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Whistleblower Secret Tracking Lookup */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-red-600" />
                  <span>Track Anonymous Whistleblower Case Status</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your confidential secret tracking hash to query the Proctorial Board & Disciplinary Squad dossier.
                </p>
              </div>

              {/* Sample quick hash button */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">Quick Sample:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingSearchHash('AR-7F3A-881C');
                    handleTrackCase('AR-7F3A-881C');
                  }}
                  className="px-2 py-1 rounded-md bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 font-mono text-[11px] font-bold hover:bg-red-100"
                >
                  AR-7F3A-881C
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={trackingSearchHash}
                  onChange={(e) => setTrackingSearchHash(e.target.value.toUpperCase())}
                  placeholder="Enter tracking hash (e.g. AR-7F3A-881C)"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-xs text-slate-900 dark:text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleTrackCase()}
                isLoading={trackingLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-5"
              >
                Query Status
              </Button>
            </div>

            {trackingError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}

            {/* Tracked Case Dossier Card */}
            {trackedCase && (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-red-50/20 dark:from-navy-950 dark:to-red-950/10 border border-red-200 dark:border-red-900/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 dark:border-red-900/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      {trackedCase.trackingHash}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                      {trackedCase.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Priority: {trackedCase.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Incident Date: {trackedCase.incidentDate}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {trackedCase.subject}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {trackedCase.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                    <span className="font-bold text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
                      Incident Location:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {trackedCase.incidentLocation}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                    <span className="font-bold text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
                      Assigned Enforcement Body:
                    </span>
                    <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {trackedCase.investigatingOfficer}
                    </span>
                  </div>
                </div>

                {/* Evidence photo preview */}
                {trackedCase.evidenceUrl && (
                  <div className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-2">
                    <span className="font-bold text-[10px] text-slate-400 block uppercase tracking-wider">
                      Photographic Evidence Submitted (Whistleblower Vault):
                    </span>
                    <div className="flex items-center gap-4">
                      <img
                        src={trackedCase.evidenceUrl}
                        alt="Evidence"
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-navy-800 shadow-sm"
                      />
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          Encrypted Evidence Image Documented
                        </p>
                        <p className="text-[10px]">Metadata & EXIF stripped to protect whistleblower anonymity.</p>
                        <a
                          href={trackedCase.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline font-bold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Full-Res Image</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disciplinary Action Taken */}
                {trackedCase.disciplinaryAction && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-1">
                    <span className="font-bold text-xs text-red-800 dark:text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Disciplinary Board Sanctions & Actions Taken:
                    </span>
                    <p className="text-xs text-red-900 dark:text-red-200 leading-relaxed">
                      {trackedCase.disciplinaryAction}
                    </p>
                  </div>
                )}

                {/* Resolution Notes */}
                {trackedCase.resolutionNotes && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold block text-[10px] text-emerald-600 mb-0.5">
                      Ombudsman & Proctorial Hearing Log:
                    </span>
                    {trackedCase.resolutionNotes}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Zero-Knowledge Certificate Verified • UGC Protected Record</span>
                  <span>Last status update: {new Date(trackedCase.updatedAt || trackedCase.createdAt).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GENERAL CAMPUS GRIEVANCES */}
      {/* ========================================================= */}
      {activeTab === 'grievances' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Standard Campus Redressal Tickets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hostel, WiFi, Mess, Library, and Academic administration support inquiries.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsGrievanceModalOpen(true)}
              icon={Plus}
            >
              Lodge Campus Ticket
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grievances
              .filter((g) => !g.isRaggingReport)
              .map((item) => (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {item.subject}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.resolutionNotes && (
                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold block text-[10px] text-emerald-600 mb-0.5">
                        Resolution Action Taken:
                      </span>
                      {item.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: APPLY FOR LEAVE WITH DURATION-BASED CHAIN */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Academic / Duty Leave"
        subtitle="Automatic multi-tier hierarchical routing with real-time quota verification."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Leave Type *
              </label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="Casual Leave (CL)">Casual Leave (CL) [Balance: {quota.casualLeave.remaining}d]</option>
                <option value="Sick / Medical Leave (ML)">Sick / Medical Leave (ML) [Balance: {quota.medicalLeave.remaining}d]</option>
                <option value="On-Duty / Academic (OD)">On-Duty / Academic Duty (OD) [Balance: {quota.onDutyLeave.remaining}d]</option>
                <option value="Emergency Leave">Family Emergency Leave</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Days Required *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={leaveForm.totalDays}
                onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Proof / Certificate Reference (Optional for CL, Mandatory for ML/OD)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={leaveForm.documentProofUrl}
                onChange={(e) => setLeaveForm({ ...leaveForm, documentProofUrl: e.target.value })}
                placeholder="https://... (Medical certificate, event invitation)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div className="flex gap-2 mt-1.5 text-[10px]">
              <span className="text-slate-400">Quick Samples:</span>
              <button
                type="button"
                onClick={() => setLeaveForm({
                  ...leaveForm,
                  documentProofUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
                })}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                + Medical Certificate
              </button>
              <button
                type="button"
                onClick={() => setLeaveForm({
                  ...leaveForm,
                  documentProofUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
                })}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                + Hackathon Invitation
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Reason / Clinical Statement *
            </label>
            <textarea
              rows={3}
              required
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="State clear purpose of leave..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          {/* Dynamic Approval Routing Preview */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-200">
            <strong>Routing Scheme: </strong>
            {leaveForm.totalDays <= 2 ? (
              <span>1 Tier (Proctor / Class Teacher approval is final)</span>
            ) : leaveForm.totalDays <= 5 ? (
              <span>2 Tiers (Proctor Endorsement → Head of Department Approval)</span>
            ) : (
              <span>3 Tiers (Proctor → HOD → Dean of Student Welfare Executive Approval)</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: LODGE ANONYMOUS ANTI-RAGGING WHISTLEBLOWER */}
      {/* ========================================================= */}
      <Modal
        isOpen={isWhistleblowerModalOpen}
        onClose={() => setIsWhistleblowerModalOpen(false)}
        title="Zero-Knowledge Anonymous Anti-Ragging Whistleblower"
        subtitle="Submit confidential complaint. Your identity will never be logged or stored."
      >
        <form onSubmit={handleWhistleblowerSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-red-800 dark:text-red-200">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-bold text-red-900 dark:text-red-100">
                100% Cryptographically Untraceable
              </strong>
              No user ID, session cookies, or student credentials are saved with this ticket. The Chief Proctor Anti-Ragging Flying Squad receives this directly.
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Incident Subject Summary *
            </label>
            <input
              type="text"
              required
              value={whistleblowerForm.subject}
              onChange={(e) => setWhistleblowerForm({ ...whistleblowerForm, subject: e.target.value })}
              placeholder="e.g. Hostile intimidation and ragging in Hostel Block B after hours"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specific Location on Campus *
              </label>
              <input
                type="text"
                required
                value={whistleblowerForm.incidentLocation}
                onChange={(e) => setWhistleblowerForm({ ...whistleblowerForm, incidentLocation: e.target.value })}
                placeholder="e.g. Hostel 4 Staircase, Cafeteria Back Alley"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Incident *
              </label>
              <input
                type="date"
                required
                value={whistleblowerForm.incidentDate}
                onChange={(e) => setWhistleblowerForm({ ...whistleblowerForm, incidentDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Photographic / Audio Evidence URL (Zero-Knowledge Stored)
            </label>
            <input
              type="url"
              value={whistleblowerForm.evidenceUrl}
              onChange={(e) => setWhistleblowerForm({ ...whistleblowerForm, evidenceUrl: e.target.value })}
              placeholder="https://... (Link to image evidence or CCTV screenshot)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-[11px]"
            />
            <div className="flex gap-2 mt-1 text-[10px]">
              <span className="text-slate-400">Quick Demo Presets:</span>
              <button
                type="button"
                onClick={() => setWhistleblowerForm({
                  ...whistleblowerForm,
                  evidenceUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80',
                })}
                className="text-red-600 dark:text-red-400 hover:underline"
              >
                + Hostel Stairwell Photo
              </button>
              <button
                type="button"
                onClick={() => setWhistleblowerForm({
                  ...whistleblowerForm,
                  evidenceUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
                })}
                className="text-red-600 dark:text-red-400 hover:underline"
              >
                + Cafeteria Incident Photo
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Narrative & Description *
            </label>
            <textarea
              rows={4}
              required
              value={whistleblowerForm.description}
              onChange={(e) => setWhistleblowerForm({ ...whistleblowerForm, description: e.target.value })}
              placeholder="Provide explicit facts: time, perpetrators identified (if known), acts committed, and any immediate physical danger..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsWhistleblowerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              isLoading={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Submit Confidential Report
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: GENERATED SECRET TRACKING HASH DIALOG */}
      {/* ========================================================= */}
      <Modal
        isOpen={generatedHashModalOpen}
        onClose={() => setGeneratedHashModalOpen(false)}
        title="Whistleblower Report Submitted Successfully"
        subtitle="Store your confidential Secret Tracking Hash safely."
      >
        <div className="space-y-4 text-xs text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <p className="text-slate-600 dark:text-slate-300">
            Your grievance has been encrypted and routed directly to the Chief Proctor and Anti-Ragging Flying Squad.
          </p>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Secret Tracking Hash (Zero-Knowledge PIN)
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-mono font-extrabold text-red-600 dark:text-red-400 tracking-wider">
                {newGeneratedHash}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(newGeneratedHash)}
                className="p-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:text-red-600"
                title="Copy hash"
              >
                {copiedHash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedHash && (
              <span className="text-[10px] text-emerald-600 font-bold block">
                Copied to clipboard!
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-200 text-left">
            <strong>Important:</strong> We do not store any link between this code and your identity. If you lose this hash, you will not be able to track the status of disciplinary hearings.
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setGeneratedHashModalOpen(false);
                setActiveTab('anti-ragging');
              }}
              className="w-full"
            >
              Done & View Live Case Tracker
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: HIERARCHICAL AUDIT LOG TIMELINE */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Leave Approval Chain Audit Trail"
        subtitle={`Applicant: ${selectedAuditLeave?.applicantName} (${selectedAuditLeave?.leaveType})`}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">Current Status</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedAuditLeave?.status} ({selectedAuditLeave?.currentStage})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Tiers Required</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {selectedAuditLeave?.requiredTiers} Tier{selectedAuditLeave?.requiredTiers > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-navy-800">
            {selectedAuditLeave?.approvalHistory?.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-3 pl-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                  step.action === 'FINAL_APPROVED'
                    ? 'bg-emerald-600 text-white'
                    : step.action === 'REJECTED'
                    ? 'bg-red-600 text-white'
                    : 'bg-brand-600 text-white'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {step.tierName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(step.timestamp).toLocaleDateString()} {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Sign-off by: {step.reviewerName}
                    </span>{' '}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-navy-950 text-slate-500 font-mono">
                      {step.reviewerRole}
                    </span>
                  </div>
                  {step.remarks && (
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-navy-950 p-2 rounded-lg border border-slate-100 dark:border-navy-850">
                      "{step.remarks}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: FACULTY / DEAN TIER REVIEW ACTION */}
      {/* ========================================================= */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Hierarchical Leave Tier Review"
        subtitle={`Applicant: ${selectedReviewLeave?.applicantName} • ${selectedReviewLeave?.totalDays} Days`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Approval Stage:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {selectedReviewLeave?.currentStage}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reason:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {selectedReviewLeave?.reason}
              </span>
            </div>
            {selectedReviewLeave?.documentProofUrl && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-navy-800">
                <span className="text-slate-400">Attached Proof:</span>
                <a
                  href={selectedReviewLeave.documentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect Attachment</span>
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Endorsement Remarks *
            </label>
            <textarea
              rows={3}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              placeholder="e.g. Verified genuine medical prescription. Escalated to HOD."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button
              variant="danger"
              onClick={() => handleTierReview('REJECT')}
              isLoading={actionLoading}
            >
              Reject Leave
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleTierReview('APPROVE')}
                isLoading={actionLoading}
              >
                Endorse / Grant Approval
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: REGULAR CAMPUS GRIEVANCE */}
      {/* ========================================================= */}
      <Modal
        isOpen={isGrievanceModalOpen}
        onClose={() => setIsGrievanceModalOpen(false)}
        title="Lodge Campus Redressal Ticket"
        subtitle="Standard institutional redressal for facilities, mess, and academics."
      >
        <form onSubmit={handleLodgeGrievance} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={grievanceForm.category}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="Academic & Courses">Academic & Courses</option>
                <option value="Hostel & Mess">Hostel & Mess Services</option>
                <option value="Campus Infrastructure">Campus WiFi & Labs Infrastructure</option>
                <option value="Library & Facilities">Central Library & Reading Rooms</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Urgency / Priority
              </label>
              <select
                value={grievanceForm.priority}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Summary *
            </label>
            <input
              type="text"
              required
              value={grievanceForm.subject}
              onChange={(e) => setGrievanceForm({ ...grievanceForm, subject: e.target.value })}
              placeholder="e.g. Weak WiFi in library cubicles"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              value={grievanceForm.description}
              onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsGrievanceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Lodge Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveGrievancePage;
