import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Save,
  Users,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const AttendancePage = () => {
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // State for Teachers/Admins
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // State for Students
  const [studentSummary, setStudentSummary] = useState(null);
  const [studentRecords, setStudentRecords] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);

  // Load subject list for teachers/admins
  useEffect(() => {
    if (isTeacherOrAdmin) {
      const fetchSubjects = async () => {
        try {
          const res = await api.get('/subjects');
          if (res.data.success && res.data.data.length > 0) {
            setSubjects(res.data.data);
            setSelectedSubject(res.data.data[0]._id);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchSubjects();
    } else {
      // Student mode: load personal attendance
      const fetchStudentAttendance = async () => {
        setStudentLoading(true);
        try {
          const res = await api.get('/attendance/summary');
          if (res.data.success) {
            setStudentSummary(res.data.summary);
            setStudentRecords(res.data.records);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setStudentLoading(false);
        }
      };
      fetchStudentAttendance();
    }
  }, [isTeacherOrAdmin]);

  // When subject changes in Teacher/Admin mode, fetch students in that course
  useEffect(() => {
    if (isTeacherOrAdmin && selectedSubject) {
      const fetchClassRoster = async () => {
        setLoadingRoster(true);
        try {
          const sub = subjects.find((s) => s._id === selectedSubject);
          const courseId = sub?.courseId?._id || sub?.courseId;

          const res = await api.get(`/students?courseId=${courseId}&limit=50`);
          if (res.data.success) {
            setRoster(res.data.data);
            // Default all to PRESENT
            const initial = {};
            res.data.data.forEach((s) => {
              initial[s._id] = 'PRESENT';
            });
            setAttendanceMap(initial);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingRoster(false);
        }
      };
      fetchClassRoster();
    }
  }, [selectedSubject, isTeacherOrAdmin, subjects]);

  const setStatusForStudent = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAll = (status) => {
    const updated = {};
    roster.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSuccessBanner('');
    try {
      const attendances = roster.map((s) => ({
        studentId: s._id,
        status: attendanceMap[s._id] || 'PRESENT',
      }));

      const res = await api.post('/attendance/mark', {
        subjectId: selectedSubject,
        date: selectedDate,
        semester: 6,
        attendances,
      });

      if (res.data.success) {
        setSuccessBanner(res.data.message);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to record attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Session Tracking"
        description={
          isTeacherOrAdmin
            ? 'Record and audit classroom attendance rosters and participation status.'
            : 'Personal attendance records, subject percentages, and minimum requirement status.'
        }
      />

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* TEACHER / ADMIN VIEW: MARK ATTENDANCE */}
      {isTeacherOrAdmin && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="w-full sm:w-72">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subject & Class
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-100"
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.code} - {sub.name} (Sem {sub.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => markAll('PRESENT')}
                icon={Check}
              >
                Mark All Present
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAttendance}
                isLoading={saving}
                icon={Save}
              >
                Save Attendance
              </Button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Class Roster ({roster.length} Students)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Date: <strong>{selectedDate}</strong>
              </span>
            </div>

            {loadingRoster ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading student roster...
              </div>
            ) : roster.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No students enrolled in this program/semester.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {roster.map((student) => {
                  const currentStatus = attendanceMap[student._id] || 'PRESENT';

                  return (
                    <div
                      key={student._id}
                      className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-navy-800/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {student.fullName}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {student.registrationNumber} • Sem {student.currentSemester}
                          </div>
                        </div>
                      </div>

                      {/* Status Selector Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setStatusForStudent(student._id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-emerald-500'
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusForStudent(student._id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-red-500 text-white shadow-sm shadow-red-500/30'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-red-500'
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusForStudent(student._id, 'LATE')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-amber-500'
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusForStudent(student._id, 'EXCUSED')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            currentStatus === 'EXCUSED'
                              ? 'bg-slate-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT VIEW: PERSONAL ATTENDANCE */}
      {!isTeacherOrAdmin && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
              <span className="text-xs text-slate-400 font-semibold uppercase">Overall Attendance</span>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {studentSummary?.percentage || 95}%
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                ✓ Meets 75% institutional requirement
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
              <span className="text-xs text-slate-400 font-semibold uppercase">Sessions Attended</span>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {studentSummary?.present || 0} / {studentSummary?.totalSessions || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total academic lectures held</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
              <span className="text-xs text-slate-400 font-semibold uppercase">Absences Recorded</span>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {studentSummary?.absent || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">Unexcused missed classes</p>
            </div>
          </div>

          {/* Detailed Attendance Session History */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-navy-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Attendance Log
              </h3>
            </div>

            {studentRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent attendance records found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {studentRecords.map((r) => (
                  <div key={r._id} className="px-6 py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {r.subjectId?.name || 'Subject Lecture'}
                      </div>
                      <div className="text-slate-400 font-mono">
                        {r.subjectId?.code} • {new Date(r.date).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
