import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  CreditCard,
  Bell,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { DashboardStatCard } from '../../components/ui/DashboardStatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/student');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading student academic workspace...</p>
      </div>
    );
  }

  const { stats, profile, subjectAttendance, recentResults, invoices, announcements } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple text-white shadow-soft relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-brand-100 text-xs font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{profile?.courseId?.name || 'Computer Science Engineering'} • SGTU Smart Generation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {profile?.fullName || 'Student'}!
            </h2>
            <p className="text-xs text-brand-200 mt-1">
              Registration: <span className="font-mono">{profile?.registrationNumber}</span> • Current Semester {profile?.currentSemester || 6}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/student/profile')}
            className="text-slate-900 font-bold self-start sm:self-auto"
          >
            View Student Profile
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Overall Attendance"
          value={`${stats?.attendancePercentage || 95}%`}
          trend={stats?.attendancePercentage >= 75 ? 'Meets Requirement' : 'Low Attendance'}
          trendText={stats?.totalClassesAttended}
          icon={CalendarCheck}
          color="emerald"
          index={0}
        />
        <DashboardStatCard
          title="Completed Submissions"
          value={stats?.completedSubmissions || 0}
          trendText="Lab exercises & assignments"
          icon={FileSpreadsheet}
          color="indigo"
          index={1}
        />
        <DashboardStatCard
          title="Outstanding Fees"
          value={`₹${(stats?.outstandingFees || 0).toLocaleString()}`}
          trend={stats?.outstandingFees === 0 ? 'Fully Paid' : 'Payment Due'}
          trendText="Term fee balance"
          icon={CreditCard}
          color={stats?.outstandingFees === 0 ? 'emerald' : 'amber'}
          index={2}
        />
        <DashboardStatCard
          title="Academic Standing"
          value={stats?.academicStatus || 'ACTIVE'}
          trendText="Enrolled & Good Standing"
          icon={Award}
          color="purple"
          index={3}
        />
      </div>

      {/* Subject-Wise Attendance Progress */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Subject Attendance Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Minimum 75% attendance mandatory to qualify for final examinations
            </p>
          </div>
          <button
            onClick={() => navigate('/attendance')}
            className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
          >
            View attendance log
          </button>
        </div>

        <div className="space-y-4">
          {(subjectAttendance || []).map((sub) => (
            <div key={sub.code} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {sub.code} - {sub.name}
                </span>
                <span
                  className={`font-mono font-bold ${
                    sub.percentage < 75 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {sub.percentage}% ({sub.present}/{sub.total} classes)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sub.percentage < 75 ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, sub.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Latest Grades & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Results */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Examination Results
            </h3>
            <button
              onClick={() => navigate('/examinations')}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Full report card
            </button>
          </div>

          <div className="space-y-2.5">
            {(recentResults || []).map((res) => (
              <div
                key={res._id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {res.subjectId?.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {res.subjectId?.code} • {res.obtainedMarks}/{res.maxMarks} Marks
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-brand-600 dark:text-brand-400 font-mono">
                    {res.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Fee Invoices & Payments
            </h3>
            <button
              onClick={() => navigate('/fees')}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Payment history
            </button>
          </div>

          <div className="space-y-2.5">
            {(invoices || []).map((inv) => (
              <div
                key={inv._id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{inv.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {inv.invoiceNumber} • Due: {new Date(inv.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{inv.totalAmount.toLocaleString()}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
