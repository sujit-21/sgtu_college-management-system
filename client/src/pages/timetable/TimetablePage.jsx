import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  BookOpen,
  Filter,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const TimetablePage = () => {
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('All');
  const [departmentCode, setDepartmentCode] = useState('CSE');
  const [semester, setSemester] = useState(6);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [collisionError, setCollisionError] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const initialForm = {
    departmentCode: 'CSE',
    courseCode: 'B.TECH-CSE',
    semester: 6,
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectName: '',
    subjectCode: '',
    teacherName: '',
    roomNumber: 'LH-101',
    type: 'Lecture',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        departmentCode,
        semester,
      });
      if (selectedDay !== 'All') {
        params.append('dayOfWeek', selectedDay);
      }
      const res = await api.get(`/timetable?${params.toString()}`);
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedDay, departmentCode, semester]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setCollisionError('');
    try {
      const res = await api.post('/timetable', formData);
      if (res.data.success) {
        setIsAddOpen(false);
        setFormData(initialForm);
        setCollisionError('');
        fetchTimetable();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setCollisionError(err.response.data.message);
      } else {
        alert(err.response?.data?.message || 'Failed to add timetable slot.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('Remove this lecture slot from schedule?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      fetchTimetable();
    } catch (err) {
      alert('Failed to remove slot.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group slots by day
  const groupedSlots = days.reduce((acc, day) => {
    acc[day] = slots.filter((s) => s.dayOfWeek === day);
    return acc;
  }, {});

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Lab':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Tutorial':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable & Lecture Schedule"
        description="Official weekly lecture planner, classroom allocations, laboratory slots, and professor schedule."
      >
        <Button variant="secondary" size="sm" onClick={handlePrint} icon={Printer}>
          Print Schedule
        </Button>
        {isAdminOrTeacher && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData({ ...initialForm, departmentCode, semester });
              setIsAddOpen(true);
            }}
            icon={Plus}
          >
            Add Lecture Slot
          </Button>
        )}
      </PageHeader>

      {/* Filter and Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-4 h-4 text-brand-500" />
            <span>Filter Program:</span>
          </div>

          <select
            value={departmentCode}
            onChange={(e) => setDepartmentCode(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-semibold"
          >
            <option value="CSE">Computer Science (CSE)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="ME">Mechanical (ME)</option>
            <option value="CIVIL">Civil Engineering</option>
          </select>

          <select
            value={semester}
            onChange={(e) => setSemester(parseInt(e.target.value, 10))}
            className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-semibold"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDay('All')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedDay === 'All'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 dark:bg-navy-950 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Full Week
          </button>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedDay === day
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-navy-950 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Container */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading academic schedule...</div>
      ) : (
        <div className="space-y-6">
          {(selectedDay === 'All' ? days : [selectedDay]).map((day) => {
            const dayLectures = groupedSlots[day] || [];
            return (
              <div
                key={day}
                className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{day}</h4>
                      <p className="text-[11px] text-slate-400">
                        {departmentCode} • Semester {semester} • {dayLectures.length} Lectures & Labs Scheduled
                      </p>
                    </div>
                  </div>
                </div>

                {dayLectures.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    No lecture sessions scheduled for this day.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dayLectures.map((slot) => (
                      <div
                        key={slot._id}
                        className="p-4 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-950/50 hover:border-brand-500/30 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeBadge(
                                slot.type
                              )}`}
                            >
                              {slot.type}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 font-semibold">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                              {slot.subjectName}
                            </h5>
                            <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-bold">
                              {slot.subjectCode}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-navy-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{slot.teacherName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <MapPin className="w-3 h-3 text-brand-500" />
                              <span>{slot.roomNumber}</span>
                            </div>
                          </div>

                          {isAdminOrTeacher && (
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                              title="Delete lecture"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule New Lecture / Lab Slot"
        subtitle={`Adding class to ${departmentCode} Semester ${semester}`}
      >
        <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
          {collisionError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold">Scheduling Clash Detected</strong>
                <span className="leading-relaxed mt-0.5">{collisionError}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Day of Week *
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Class Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Practical Lab</option>
                <option value="Tutorial">Tutorial / Discussion</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="text"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="e.g. 09:00 AM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="text"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="e.g. 10:00 AM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder="e.g. Distributed Cloud Computing"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="e.g. CS601"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty / Professor *
              </label>
              <input
                type="text"
                required
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                placeholder="e.g. Dr. Amit Verma"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Classroom / Laboratory *
              </label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. Lecture Hall 101"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save to Timetable
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default TimetablePage;
