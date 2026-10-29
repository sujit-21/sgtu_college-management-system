import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Shield,
  User,
  Calendar,
  MessageSquare,
  HelpCircle,
  Filter,
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

  const [activeTab, setActiveTab] = useState('leaves'); // 'leaves' | 'grievances'
  const [leaves, setLeaves] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [leaveForm, setLeaveForm] = useState({
    applicantName: user?.email?.split('@')[0] || 'Arjun Kumar',
    applicantRole: user?.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
    leaveType: 'Sick / Medical Leave',
    startDate: '',
    endDate: '',
    totalDays: 1,
    reason: '',
  });

  const [grievanceForm, setGrievanceForm] = useState({
    category: 'Academic & Courses',
    subject: '',
    description: '',
    priority: 'MEDIUM',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, grievancesRes] = await Promise.all([
        api.get('/leave-grievance/leaves'),
        api.get('/leave-grievance/grievances'),
      ]);
      if (leavesRes.data.success) setLeaves(leavesRes.data.data);
      if (grievancesRes.data.success) setGrievances(grievancesRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          leaveType: 'Sick / Medical Leave',
          startDate: '',
          endDate: '',
          totalDays: 1,
          reason: '',
        });
        alert('Leave application submitted for approval.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for leave.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      await api.patch(`/leave-grievance/leaves/${id}`, {
        status,
        approvalRemarks: status === 'APPROVED' ? 'Approved by HOD' : 'Rejected due to academic schedule clash',
      });
      fetchData();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

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
          category: 'Academic & Courses',
          subject: '',
          description: '',
          priority: 'MEDIUM',
        });
        alert('Grievance lodged. The university ombudsman committee has been notified.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to lodge grievance.');
    } finally {
      setActionLoading(false);
    }
  };

  const leaveColumns = [
    {
      header: 'Applicant',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white leading-tight">
            {row.applicantName}
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-500">
            {row.applicantRole}
          </span>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
          {row.leaveType}
        </span>
      ),
    },
    {
      header: 'Duration & Dates',
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
      header: 'Reason / Purpose',
      render: (row) => (
        <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
          {row.reason}
        </div>
      ),
    },
    {
      header: 'Status',
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
            <span className="text-[9px] text-slate-400 block mt-0.5">By {row.approvedBy}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (row) =>
        isAdminOrTeacher && row.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleUpdateLeaveStatus(row._id, 'APPROVED')}
              className="text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleUpdateLeaveStatus(row._id, 'REJECTED')}
              className="text-[11px] font-bold px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
            >
              Reject
            </button>
          </div>
        ) : null,
    },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Applications & Campus Grievance Helpdesk"
        description="Official institutional student and faculty leave workflows, grievance redressal, and dispute resolution."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsGrievanceModalOpen(true)}
            icon={AlertCircle}
          >
            Lodge Grievance
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

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'leaves'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Leave Applications ({leaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grievances')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'grievances'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Campus Grievances & Redressal ({grievances.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading records...</div>
      ) : activeTab === 'leaves' ? (
        <DataTable
          columns={leaveColumns}
          data={leaves}
          loading={loading}
          emptyMessage="No leave applications on record."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {grievances.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {item.status}
                    </span>
                  </div>
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
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Academic / Duty Leave"
        subtitle="Submit official leave request to Head of Department."
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
                <option value="Sick / Medical Leave">Sick / Medical Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Academic Duty">Academic Duty / Conference</option>
                <option value="Emergency">Family Emergency</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Days *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={leaveForm.totalDays}
                onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
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
              Reason / Medical Certificate Reference *
            </label>
            <textarea
              rows={3}
              required
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="State reason for absence..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
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

      {/* Lodge Grievance Modal */}
      <Modal
        isOpen={isGrievanceModalOpen}
        onClose={() => setIsGrievanceModalOpen(false)}
        title="Lodge Campus Grievance / Complaint"
        subtitle="Confidential submission to University Ombudsman & Dean."
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
                <option value="Anti-Ragging / Security">Anti-Ragging / Security Safety</option>
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
                <option value="URGENT">Urgent (Immediate attention)</option>
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
              placeholder="e.g. Broken AC unit in Lab 3 or Course Elective clash"
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
              placeholder="Describe the issue, specific location, or affected student group..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsGrievanceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Lodge Grievance Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default LeaveGrievancePage;
