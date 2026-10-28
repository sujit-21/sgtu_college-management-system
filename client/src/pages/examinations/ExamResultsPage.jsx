import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  Calendar,
  Clock,
  Printer,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const ExamResultsPage = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Marks Entry Modal (Staff)
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [studentRoster, setStudentRoster] = useState([]);
  const [marksState, setMarksState] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState('');

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/examinations');
      if (res.data.success) {
        setExams(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedExam(res.data.data[0]);
          loadResults(res.data.data[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (examId) => {
    try {
      const res = await api.get(`/examinations/${examId}/results`);
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadExams();
    if (isStaff) {
      const fetchSubs = async () => {
        try {
          const res = await api.get('/subjects');
          if (res.data.success) {
            setSubjects(res.data.data);
            if (res.data.data.length > 0) setSelectedSubjectId(res.data.data[0]._id);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchSubs();
    }
  }, [isStaff]);

  const handlePublishResults = async () => {
    if (!selectedExam) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/examinations/${selectedExam._id}/publish`);
      if (res.data.success) {
        setFeedbackBanner('Results have been officially published to student portals!');
        loadExams();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to publish results.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open marks entry modal
  const openMarksEntry = async () => {
    setIsMarksModalOpen(true);
    try {
      const res = await api.get('/students?limit=50');
      if (res.data.success) {
        setStudentRoster(res.data.data);
        const initial = {};
        res.data.data.forEach((s) => {
          initial[s._id] = 85; // default marks
        });
        setMarksState(initial);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const marksList = studentRoster.map((s) => ({
        studentId: s._id,
        obtainedMarks: Number(marksState[s._id] || 0),
        maxMarks: 100,
      }));

      const res = await api.post('/examinations/marks', {
        examinationId: selectedExam._id,
        subjectId: selectedSubjectId,
        marksList,
      });

      if (res.data.success) {
        setIsMarksModalOpen(false);
        setFeedbackBanner(`Saved marks for ${marksList.length} students.`);
        loadResults(selectedExam._id);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to enter marks.');
    } finally {
      setActionLoading(false);
    }
  };

  const printReportCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations, Schedules & Grade Reports"
        description="Official university examination timetables, grade distributions, and transcripts."
      >
        {!isStaff && (
          <Button variant="secondary" size="sm" onClick={printReportCard} icon={Printer}>
            Print Grade Sheet
          </Button>
        )}

        {isStaff && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={openMarksEntry} icon={Award}>
              Enter Subject Marks
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={handlePublishResults}
              isLoading={actionLoading}
              icon={CheckCircle2}
            >
              Publish Results
            </Button>
          </div>
        )}
      </PageHeader>

      {feedbackBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{feedbackBanner}</span>
          </div>
          <button onClick={() => setFeedbackBanner('')} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Exam Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {exams.map((exam) => (
          <button
            key={exam._id}
            onClick={() => {
              setSelectedExam(exam);
              loadResults(exam._id);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedExam?._id === exam._id
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            {exam.title}
          </button>
        ))}
      </div>

      {selectedExam && (
        <div className="space-y-6">
          {/* Exam Timetable Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Examination Timetable & Seating Schedule
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Academic Year: {selectedExam.academicYear} • Status:{' '}
                  <StatusBadge status={selectedExam.status} />
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950 border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Examination Room</th>
                    <th className="px-4 py-2.5">Max Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {(selectedExam.schedules || []).map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(s.examDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {s.startTime} - {s.endTime}
                      </td>
                      <td className="px-4 py-3 font-bold text-brand-600 dark:text-brand-400">
                        {s.subjectId?.code} - {s.subjectId?.name}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {s.room}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {s.maxMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Published Results / Grade Sheet */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isStaff ? 'Published Student Performance' : 'Official Semester Grade Sheet'}
                </h3>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {selectedExam.status === 'RESULTS_PUBLISHED'
                  ? 'No published results available yet.'
                  : 'Results have not been officially published yet for this examination.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-navy-950 border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      {isStaff && <th className="px-5 py-3">Student</th>}
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">Credits</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">Letter Grade</th>
                      <th className="px-5 py-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {results.map((res) => (
                      <tr key={res._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40">
                        {isStaff && (
                          <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                            {res.studentId?.fullName} ({res.studentId?.registrationNumber})
                          </td>
                        )}
                        <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {res.subjectId?.code} - {res.subjectId?.name}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {res.subjectId?.credits || 4}
                        </td>
                        <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {res.obtainedMarks} / {res.maxMarks}
                        </td>
                        <td className="px-5 py-3 font-extrabold text-brand-600 dark:text-brand-400 font-mono text-base">
                          {res.grade}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                            PASS
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staff: Enter Marks Modal */}
      <Modal
        isOpen={isMarksModalOpen}
        onClose={() => setIsMarksModalOpen(false)}
        title="Enter Subject Examination Marks"
        subtitle="Batch input evaluated exam marks for student cohort."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Subject *</label>
            <select
              required
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800">
            {studentRoster.map((student) => (
              <div key={student._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {student.registrationNumber}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Marks / 100:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={marksState[student._id] || ''}
                    onChange={(e) =>
                      setMarksState({ ...marksState, [student._id]: e.target.value })
                    }
                    className="w-20 text-xs font-mono font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-navy-950 border rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsMarksModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Marks
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
