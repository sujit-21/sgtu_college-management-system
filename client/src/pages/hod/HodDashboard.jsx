import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  LifeBuoy,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Phone,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { DashboardStatCard } from '../../components/ui/DashboardStatCard';
import { Button } from '../../components/ui/Button';

export const HodDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHodData = async () => {
      try {
        const res = await api.get('/dashboard/hod');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load HOD dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHodData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading Department Leadership Portal...</p>
      </div>
    );
  }

  const { department, stats, facultyWorkload, courses, pendingLeaves, recentGrievances } = data || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Department of ${department?.name || 'Computer Science & Engineering'}`}
        subtitle={`Executive Academic & Faculty Governance Dashboard • HOD: ${department?.headName || 'Prof. Rajesh Sharma'}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/timetable')}
            className="flex items-center gap-1.5 text-xs"
          >
            <Calendar className="w-4 h-4" />
            Class Timetable
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/leave-grievance')}
            className="flex items-center gap-1.5 text-xs"
          >
            <LifeBuoy className="w-4 h-4" />
            Leaves ({stats?.pendingFacultyLeaves || 0})
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/question-papers')}
            className="bg-primary hover:bg-primary-600 text-white flex items-center gap-1.5 text-xs shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            PYQ Archives
          </Button>
        </div>
      </PageHeader>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalStudents || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Department Enrolled Students
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalFaculty || 0} Professors
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Teaching Faculty Members
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.avgSemesterPassRate || '93.2%'}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Semester Pass Percentage
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.pendingFacultyLeaves || 0} Pending
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Faculty Leave Approvals
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Faculty Workload & Department Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Teaching Workload (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Faculty Teaching Workload &amp; Subject Allotment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly teaching hours, assigned modules, and departmental faculty directory.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/teachers')}
              className="text-xs"
            >
              Manage Faculty
            </Button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Assigned Subjects</th>
                  <th className="py-3 px-4">Weekly Load</th>
                  <th className="py-3 px-4 text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {facultyWorkload && facultyWorkload.length > 0 ? (
                  facultyWorkload.map((faculty) => (
                    <tr key={faculty._id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{faculty.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{faculty.employeeId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{faculty.designation}</span>
                        <div className="text-[10px] text-slate-400">{faculty.specialization}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {faculty.assignedSubjects && faculty.assignedSubjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {faculty.assignedSubjects.map((sub, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-[11px]"
                              >
                                {sub.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No direct subjects</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {faculty.weeklyLectureHours} hrs / wk
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] font-mono text-slate-500">{faculty.phone}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No faculty members assigned to this department yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Department Programs & Quick Actions (1 col) */}
        <div className="space-y-6">
          {/* Department Academic Programs */}
          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Degree Programs ({courses?.length || 1})
            </h3>
            <div className="space-y-3">
              {courses && courses.length > 0 ? (
                courses.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-lg border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/60 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                      <span>{c.name}</span>
                      <span className="text-primary font-mono">{c.code}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Duration: {c.durationYears} Years &bull; {c.totalSemesters} Semesters &bull; {c.credits} Credits
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No active degree programs found.</div>
              )}
            </div>
          </div>

          {/* Pending Faculty Leaves Review */}
          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-500" />
                Faculty Leave Desk
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/leave-grievance')}
                className="text-xs"
              >
                Review All
              </Button>
            </div>

            <div className="space-y-2.5">
              {pendingLeaves && pendingLeaves.length > 0 ? (
                pendingLeaves.slice(0, 3).map((leave) => (
                  <div
                    key={leave._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/50 space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{leave.applicantName || 'Faculty Applicant'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-semibold">
                        {leave.totalDays} Days
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {leave.reason}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-navy-800/40 rounded-lg">
                  No pending faculty leave applications requiring approval.
                </div>
              )}
            </div>
          </div>

          {/* Department Quick Navigation Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/examinations')}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200 dark:border-navy-800 text-left transition-all hover:border-primary/40 group"
            >
              <Award className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Exam Results</div>
              <div className="text-[10px] text-slate-400">Moderation &amp; Grades</div>
            </button>

            <button
              onClick={() => navigate('/admin/students')}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200 dark:border-navy-800 text-left transition-all hover:border-primary/40 group"
            >
              <Users className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Student Roster</div>
              <div className="text-[10px] text-slate-400">Class Admissions</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
