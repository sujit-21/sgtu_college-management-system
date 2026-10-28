import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Building2,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { DashboardStatCard } from '../../components/ui/DashboardStatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading university administrative metrics...</p>
      </div>
    );
  }

  const { stats, charts, announcements, recentActivity } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Command Center"
        description="Comprehensive overview of university operations, student demographics, and financial status."
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/announcements')}
          icon={Bell}
        >
          Post Notice
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/admin/students')}
          icon={Plus}
        >
          Manage Students
        </Button>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          trend="+14.2%"
          trendText="from last semester"
          icon={Users}
          color="indigo"
          index={0}
        />
        <DashboardStatCard
          title="Faculty Members"
          value={stats?.totalTeachers || 0}
          trend="+2 New"
          trendText="joined this term"
          icon={UserCheck}
          color="purple"
          index={1}
        />
        <DashboardStatCard
          title="Overall Attendance"
          value={stats?.attendanceRate || '0%'}
          trend="+3.4%"
          trendText="above 85% requirement"
          icon={CalendarCheck}
          color="emerald"
          index={2}
        />
        <DashboardStatCard
          title="Pending Fees"
          value={`₹${(stats?.pendingFees || 0).toLocaleString()}`}
          trend="₹117k"
          trendText="collected this term"
          icon={CreditCard}
          color="amber"
          index={3}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Attendance Trajectory (%)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Campus-wide physical & lab session attendance rate
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Above Target</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyAttendanceTrend || []}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAtt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Student Distribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Students per Department
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across programs</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.departmentDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Announcements & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Campus Notices
              </h3>
            </div>
            <button
              onClick={() => navigate('/announcements')}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(announcements || []).map((ann) => (
              <div
                key={ann._id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800/80 transition-all hover:border-brand-500/30"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {ann.title}
                  </span>
                  <StatusBadge status={ann.category} text={ann.category} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {ann.content}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>By {ann.authorName}</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity & Audit Trail */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Real-Time Security & Audit Trail
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {(recentActivity || []).map((log) => (
              <div
                key={log._id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 text-xs border border-slate-100 dark:border-navy-800/80"
              >
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {log.details || log.resource}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
