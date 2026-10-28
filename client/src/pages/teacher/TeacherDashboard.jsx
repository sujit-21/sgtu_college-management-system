import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { DashboardStatCard } from '../../components/ui/DashboardStatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/teacher');
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
        <p className="text-xs text-slate-400">Loading faculty dashboard...</p>
      </div>
    );
  }

  const { stats, subjects, recentAssignments } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Academic Dashboard"
        description="Manage assigned courses, schedule lectures, monitor attendance, and review student coursework."
      >
        <Button variant="secondary" size="sm" onClick={() => navigate('/attendance')} icon={CalendarCheck}>
          Take Attendance
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/assignments')} icon={FileSpreadsheet}>
          Create Assignment
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Assigned Subjects"
          value={stats?.assignedSubjectsCount || 0}
          trendText="Active this semester"
          icon={BookOpen}
          color="indigo"
          index={0}
        />
        <DashboardStatCard
          title="Active Assignments"
          value={stats?.totalAssignments || 0}
          trendText="Published coursework"
          icon={FileSpreadsheet}
          color="purple"
          index={1}
        />
        <DashboardStatCard
          title="Submissions to Grade"
          value={stats?.pendingGradingCount || 0}
          trend={stats?.pendingGradingCount > 0 ? 'Action Needed' : 'All Clear'}
          trendText="Student submissions"
          icon={Award}
          color="amber"
          index={2}
        />
        <DashboardStatCard
          title="Average Attendance"
          value={stats?.averageAttendance || '95%'}
          trend="+2.1%"
          trendText="Across all classes"
          icon={TrendingUp}
          color="emerald"
          index={3}
        />
      </div>

      {/* Center Grid: Assigned Subjects & Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Subjects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              My Assigned Subjects & Classes
            </h3>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              {subjects?.length || 0} Courses
            </span>
          </div>

          <div className="space-y-3">
            {(subjects || []).map((sub) => (
              <div
                key={sub._id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {sub.code}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {sub.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sub.courseId?.code} • Semester {sub.semester} • {sub.credits} Credits
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/attendance')}
                  className="text-xs"
                >
                  Roster
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments & Grading */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Coursework & Evaluation
            </h3>
            <button
              onClick={() => navigate('/assignments')}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {(recentAssignments || []).map((a) => (
              <div
                key={a._id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {a.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    <span>• {a.totalMarks} Marks</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/assignments')}
                  className="text-xs"
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
