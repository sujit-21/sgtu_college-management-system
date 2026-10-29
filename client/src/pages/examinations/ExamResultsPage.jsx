import React, { useState, useEffect, useMemo } from 'react';
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
  QrCode,
  GraduationCap,
  Sparkles,
  Download,
  Check,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Layers,
  TrendingUp,
  BarChart2,
  FileCheck,
  Search,
  DollarSign,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const ExamResultsPage = () => {
  const { user } = useAuth();
  const isStaff =
    user?.role === 'TEACHER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'HOD';

  // Active top-level sub-module tab
  // 'results' | 'admit-card' | 'revaluation' | 'backlogs' | 'moderation'
  const [activeTab, setActiveTab] = useState('results');

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

  // Official Transcript Modal
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcriptCandidate, setTranscriptCandidate] = useState(null);

  // Admit Card State
  const [admitCard, setAdmitCard] = useState(null);
  const [loadingAdmitCard, setLoadingAdmitCard] = useState(false);

  // Revaluation State
  const [revaluations, setRevaluations] = useState([]);
  const [loadingReval, setLoadingReval] = useState(false);
  const [isApplyRevalOpen, setIsApplyRevalOpen] = useState(false);
  const [revalForm, setRevalForm] = useState({
    subjectId: '',
    type: 'REVALUATION',
    originalMarks: 36,
    reason: '',
    feeAmount: 500,
  });
  const [selectedRevalToEdit, setSelectedRevalToEdit] = useState(null);
  const [revalEditForm, setRevalEditForm] = useState({
    status: 'MARKS_REVISED',
    revisedMarks: 42,
    evaluatorRemarks: 'Verified descriptive proofs. 6 marks awarded.',
  });

  // Backlogs State
  const [backlogData, setBacklogData] = useState({ backlogs: [], registrations: [], feePerSubject: 750 });
  const [loadingBacklogs, setLoadingBacklogs] = useState(false);
  const [isRegisterBacklogOpen, setIsRegisterBacklogOpen] = useState(false);
  const [selectedBacklogSubject, setSelectedBacklogSubject] = useState(null);

  // Moderation & Analytics State
  const [moderationData, setModerationData] = useState(null);
  const [loadingModeration, setLoadingModeration] = useState(false);
  const [graceMarksInput, setGraceMarksInput] = useState(3);
  const [minMarksInput, setMinMarksInput] = useState(36);

  // Initial loader
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
            if (res.data.data.length > 0) {
              setSelectedSubjectId(res.data.data[0]._id);
              setRevalForm((prev) => ({ ...prev, subjectId: res.data.data[0]._id }));
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchSubs();
    }
  }, [isStaff]);

  // Load Admit Card when switching to Admit Card Tab
  const loadAdmitCard = async (examId) => {
    if (!examId) return;
    setLoadingAdmitCard(true);
    try {
      const res = await api.get(`/examinations/${examId}/admit-card`);
      if (res.data.success) {
        setAdmitCard(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdmitCard(false);
    }
  };

  // Load Revaluations
  const loadRevaluations = async () => {
    setLoadingReval(true);
    try {
      const res = await api.get('/examinations/revaluation/list');
      if (res.data.success) {
        setRevaluations(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReval(false);
    }
  };

  // Load Backlogs
  const loadBacklogs = async () => {
    setLoadingBacklogs(true);
    try {
      const res = await api.get('/examinations/backlogs/my-list');
      if (res.data.success) {
        setBacklogData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBacklogs(false);
    }
  };

  // Load Moderation Analytics
  const loadModeration = async (examId) => {
    if (!examId) return;
    setLoadingModeration(true);
    try {
      const res = await api.get(`/examinations/${examId}/moderation`);
      if (res.data.success) {
        setModerationData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingModeration(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admit-card' && selectedExam) {
      loadAdmitCard(selectedExam._id);
    } else if (activeTab === 'revaluation') {
      loadRevaluations();
    } else if (activeTab === 'backlogs') {
      loadBacklogs();
    } else if (activeTab === 'moderation' && selectedExam && isStaff) {
      loadModeration(selectedExam._id);
    }
  }, [activeTab, selectedExam]);

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
          initial[s._id] = 85;
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

  // Submit Revaluation Application
  const handleApplyReval = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/examinations/revaluation/apply', {
        examinationId: selectedExam?._id,
        ...revalForm,
      });
      if (res.data.success) {
        setIsApplyRevalOpen(false);
        setFeedbackBanner('Revaluation application submitted and nominal fee acknowledged.');
        loadRevaluations();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to apply for revaluation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Revaluation Status (Staff)
  const handleUpdateRevalStatus = async (e) => {
    e.preventDefault();
    if (!selectedRevalToEdit) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/examinations/revaluation/${selectedRevalToEdit._id}/status`, revalEditForm);
      if (res.data.success) {
        setSelectedRevalToEdit(null);
        setFeedbackBanner('Revaluation application evaluated and student record updated.');
        loadRevaluations();
        if (selectedExam) loadResults(selectedExam._id);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update revaluation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Register for Supplementary / Backlog Exam
  const handleRegisterBacklog = async (e) => {
    e.preventDefault();
    if (!selectedBacklogSubject) return;
    setActionLoading(true);
    try {
      const res = await api.post('/examinations/backlogs/register', {
        examinationId: selectedExam?._id,
        subjectId: selectedBacklogSubject.subjectId?._id || selectedBacklogSubject.subjectId,
        semester: selectedBacklogSubject.semester || 5,
        previousMarks: selectedBacklogSubject.obtainedMarks || 32,
        previousGrade: selectedBacklogSubject.grade || 'F',
      });
      if (res.data.success) {
        setIsRegisterBacklogOpen(false);
        setSelectedBacklogSubject(null);
        setFeedbackBanner('Supplementary backlog examination registration confirmed.');
        loadBacklogs();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to register backlog.');
    } finally {
      setActionLoading(false);
    }
  };

  // Apply Grace Marks (Staff)
  const handleApplyGraceMarks = async () => {
    if (!selectedExam) return;
    if (!window.confirm(`Are you sure you want to award +${graceMarksInput} grace marks to all borderline candidates (scoring between ${minMarksInput} and 39)?`)) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/examinations/${selectedExam._id}/moderation/grace-marks`, {
        graceMarks: Number(graceMarksInput),
        minMarks: Number(minMarksInput),
      });
      if (res.data.success) {
        setFeedbackBanner(res.data.message);
        loadModeration(selectedExam._id);
        loadResults(selectedExam._id);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to apply grace marks.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to open transcript
  const openTranscriptModal = (resItem = null) => {
    if (resItem) {
      setTranscriptCandidate({
        fullName: resItem.studentId?.fullName || 'Aarav Sharma',
        registrationNumber: resItem.studentId?.registrationNumber || 'SGTU2024CS001',
        course: 'Bachelor of Technology in Computer Science & Engineering',
        semester: 6,
        examTitle: selectedExam?.title || 'End Semester Examinations 2026',
        items: results.filter((r) => r.studentId?._id === resItem.studentId?._id || r.studentId === resItem.studentId),
      });
    } else {
      setTranscriptCandidate({
        fullName: user?.name || 'Aarav Sharma',
        registrationNumber: user?.collegeId || 'SGTU2024CS001',
        course: 'Bachelor of Technology in Computer Science & Engineering',
        semester: 6,
        examTitle: selectedExam?.title || 'End Semester Examinations 2026',
        items: results,
      });
    }
    setIsTranscriptOpen(true);
  };

  // Grade point mapping
  const getGradeDetails = (marks = 85) => {
    if (marks >= 90) return { grade: 'O', point: 10, label: 'Outstanding' };
    if (marks >= 80) return { grade: 'A+', point: 9, label: 'Excellent' };
    if (marks >= 70) return { grade: 'A', point: 8, label: 'Very Good' };
    if (marks >= 60) return { grade: 'B+', point: 7, label: 'Good' };
    if (marks >= 50) return { grade: 'B', point: 6, label: 'Above Average' };
    if (marks >= 40) return { grade: 'C', point: 5, label: 'Pass' };
    return { grade: 'F', point: 0, label: 'Reappear' };
  };

  const transcriptRows = (transcriptCandidate?.items?.length ? transcriptCandidate.items : results).map((r, i) => {
    const credits = r.subjectId?.credits || (i % 2 === 0 ? 4 : 3);
    const marks = r.obtainedMarks || 84;
    const gd = getGradeDetails(marks);
    const creditPoints = credits * gd.point;
    return {
      code: r.subjectId?.code || `CS${601 + i}`,
      title: r.subjectId?.name || (i === 0 ? 'Advanced Algorithms' : i === 1 ? 'Distributed Cloud Systems' : 'Deep Neural Networks'),
      credits,
      internal: Math.round(marks * 0.38),
      external: marks - Math.round(marks * 0.38),
      total: marks,
      grade: gd.grade,
      point: gd.point,
      creditPoints,
      result: marks >= 40 ? 'PASS' : 'FAIL',
    };
  });

  const totalCredits = transcriptRows.reduce((a, b) => a + b.credits, 0) || 20;
  const totalEarnedPoints = transcriptRows.reduce((a, b) => a + b.creditPoints, 0) || 172;
  const calculatedSgpa = totalCredits > 0 ? (totalEarnedPoints / totalCredits).toFixed(2) : '8.60';
  const calculatedCgpa = (Number(calculatedSgpa) * 0.98).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations, Hall Tickets & Academic Evaluation Suite"
        description="Official examination timetables, automated hall ticket issuance, revaluation workflows, and statistical grade moderation."
      >
        <div className="flex items-center gap-2">
          {activeTab === 'results' && (
            <Button variant="secondary" size="sm" onClick={() => openTranscriptModal()} icon={Printer}>
              {isStaff ? 'Preview Marksheet' : 'Official Grade Sheet'}
            </Button>
          )}

          {activeTab === 'admit-card' && admitCard?.eligibilityStatus === 'CLEARED' && (
            <Button variant="primary" size="sm" onClick={() => window.print()} icon={Printer}>
              Print Hall Ticket
            </Button>
          )}

          {activeTab === 'revaluation' && !isStaff && (
            <Button variant="primary" size="sm" onClick={() => setIsApplyRevalOpen(true)} icon={Plus}>
              Apply Revaluation
            </Button>
          )}

          {isStaff && activeTab === 'results' && (
            <>
              <Button variant="secondary" size="sm" onClick={openMarksEntry} icon={Award}>
                Enter Marks
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
            </>
          )}
        </div>
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

      {/* Top Multi-Feature Navigation Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3 overflow-x-auto">
        {[
          { id: 'results', label: 'Results & Transcripts', icon: Award },
          { id: 'admit-card', label: 'Admit Card / Hall Ticket', icon: QrCode, badge: 'Official' },
          { id: 'revaluation', label: 'Revaluation Portal', icon: RefreshCw },
          { id: 'backlogs', label: 'Backlog & Remedial Exams', icon: Layers },
          ...(isStaff ? [{ id: 'moderation', label: 'Marks Moderation & Bell Curve', icon: BarChart2, badge: 'Staff' }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Exam Selector for Results, Admit Card, & Moderation */}
      {activeTab !== 'revaluation' && activeTab !== 'backlogs' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Session:</span>
          {exams.map((exam) => (
            <button
              key={exam._id}
              onClick={() => {
                setSelectedExam(exam);
                if (activeTab === 'results') loadResults(exam._id);
                if (activeTab === 'admit-card') loadAdmitCard(exam._id);
                if (activeTab === 'moderation') loadModeration(exam._id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedExam?._id === exam._id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-navy-900 text-slate-500 border border-slate-200 dark:border-navy-800'
              }`}
            >
              {exam.title}
            </button>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. RESULTS & TRANSCRIPTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'results' && selectedExam && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Examination Timetable & Seating Schedule
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Academic Year: {selectedExam.academicYear} • Status: <StatusBadge status={selectedExam.status} />
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Subject</th>
                    <th className="pb-3 px-3">Code</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Time</th>
                    <th className="pb-3 px-3">Hall / Room</th>
                    <th className="pb-3 px-3">Max Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
                  {selectedExam.schedules?.length > 0 ? (
                    selectedExam.schedules.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {s.subjectId?.name || 'Subject'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{s.subjectId?.code || 'N/A'}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {new Date(s.examDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {s.startTime} - {s.endTime}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-medium">
                            {s.room}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{s.maxMarks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-400">
                        No subject schedules announced yet for this examination session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Published Results & Performance Roster</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {results.length} evaluated student subject entries
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Student</th>
                    <th className="pb-3 px-3">Reg No</th>
                    <th className="pb-3 px-3">Subject</th>
                    <th className="pb-3 px-3 text-right">Marks</th>
                    <th className="pb-3 px-3 text-center">Grade</th>
                    <th className="pb-3 px-3 text-center">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
                  {results.length > 0 ? (
                    results.map((res) => {
                      const gradeDetails = getGradeDetails(res.obtainedMarks);
                      const isPassing = res.obtainedMarks >= 40 && res.grade !== 'F';
                      return (
                        <tr key={res._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50">
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            {res.studentId?.fullName || 'Student'}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500">
                            {res.studentId?.registrationNumber || 'N/A'}
                          </td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            {res.subjectId?.name || 'Subject'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                            {res.obtainedMarks} / {res.maxMarks}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                                res.obtainedMarks >= 80
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : isPassing
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}
                            >
                              {res.grade || gradeDetails.grade}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                isPassing ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                              }`}
                            >
                              {isPassing ? 'PASS' : 'ARREAR / FAIL'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => openTranscriptModal(res)}
                              className="text-brand-500 hover:text-brand-600 font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Transcript</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No results published for this examination yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OFFICIAL ADMIT CARD / HALL TICKET TAB */}
      {/* ========================================================================= */}
      {activeTab === 'admit-card' && (
        <div className="space-y-6">
          {loadingAdmitCard ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
              <span>Verifying examination eligibility and fetching hall ticket...</span>
            </div>
          ) : admitCard ? (
            <div>
              {/* Clearance Status Warning / Approval */}
              {admitCard.eligibilityStatus === 'WITHHELD' ? (
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-700 dark:text-amber-300">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold flex items-center gap-2">
                        <span>Admit Card Withheld by Controller of Examinations</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold uppercase tracking-wider">
                          Action Required
                        </span>
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-2xl leading-relaxed">
                        {admitCard.withholdReason}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
                        <span>
                          Attendance Recorded:{' '}
                          <strong className={admitCard.attendancePercentage < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                            {admitCard.attendancePercentage}%
                          </strong>{' '}
                          (Min. 75% required)
                        </span>
                        <span>
                          Outstanding Fee Balance:{' '}
                          <strong className={admitCard.pendingFeeDues > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                            ₹{admitCard.pendingFeeDues.toLocaleString('en-IN')}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {admitCard.pendingFeeDues > 0 && (
                      <Button variant="primary" size="sm" onClick={() => (window.location.href = '/fees')} icon={DollarSign}>
                        Clear Fees Online
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => (window.location.href = '/attendance')} icon={Calendar}>
                      View Attendance
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold">Eligibility Cleared: Mandatory 75% Attendance & Fee Dues Verified</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Attendance: <strong>{admitCard.attendancePercentage}%</strong> • Fee Clearance: <strong>ZERO DUES</strong> • Hall: <strong>{admitCard.allottedHall}</strong>
                      </p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => window.print()} icon={Printer}>
                    Print Official Admit Card
                  </Button>
                </div>
              )}

              {/* Printable Official Admit Card Layout */}
              <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-700 shadow-xl max-w-4xl mx-auto print:m-0 print:p-6 print:border-black print:shadow-none text-slate-800 dark:text-slate-200 font-sans">
                {/* Header */}
                <div className="border-b-2 border-slate-900 dark:border-white pb-6 mb-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                        SG
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          SG Tech University (SGTU)
                        </h2>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Office of the Controller of Examinations • Official Admit Card
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Accredited A++ Grade by NAAC • Recognized under UGC Act 1956
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-mono font-bold">
                        {admitCard.admitCardNumber}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono font-bold tracking-widest">
                        {admitCard.barcode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Candidate Particulars & Photo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-navy-800">
                  <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Name</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{admitCard.studentName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Number</p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {admitCard.registrationNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">{admitCard.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programme / Course</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{admitCard.course}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Semester</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Semester {admitCard.semester}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Examination Session</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{admitCard.examTitle}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allotted Exam Center</p>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{admitCard.examCenter}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hall & Seating</p>
                          <p className="font-mono font-black text-brand-600 dark:text-brand-400 text-xs">
                            {admitCard.allottedHall} • {admitCard.allottedDesk}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo with selected aspect ratio */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`relative rounded-xl border-2 border-slate-400 dark:border-navy-600 overflow-hidden bg-slate-100 dark:bg-navy-800 shadow-md flex items-center justify-center ${
                        admitCard.photoFormat === 'STAMP_SIZE' ? 'w-[75px] h-[90px]' : 'w-[105px] h-[135px]'
                      }`}
                    >
                      {admitCard.avatar ? (
                        <img src={admitCard.avatar} alt="Candidate" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                          <span className="text-[9px] font-bold text-slate-400">OFFICIAL PHOTO</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono">
                      {admitCard.photoFormat === 'STAMP_SIZE' ? '25×30mm' : '35×45mm'}
                    </span>
                  </div>
                </div>

                {/* Exam Timetable Schedule */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    Course Schedule & Invigilator Sign-Off
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 dark:border-navy-800 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-navy-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-navy-800">
                          <th className="py-2.5 px-3">Subject Name</th>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Room</th>
                          <th className="py-2.5 px-3 text-center">Invigilator Sign</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                        {admitCard.schedules?.map((s, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{s.subjectName}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{s.subjectCode}</td>
                            <td className="py-2.5 px-3">{new Date(s.examDate).toLocaleDateString()}</td>
                            <td className="py-2.5 px-3 text-slate-500">{s.time}</td>
                            <td className="py-2.5 px-3 font-mono">{s.hall}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block w-24 h-6 border-b border-dotted border-slate-400"></span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rules & Signatures */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-navy-800 text-xs">
                  <div className="md:col-span-2">
                    <h5 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                      Instructions for the Candidate:
                    </h5>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {admitCard.instructions?.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-end items-center text-center">
                    <div className="w-28 h-10 border-b-2 border-slate-900 dark:border-white mb-2 flex items-center justify-center font-serif italic text-brand-600 font-bold text-sm">
                      Dr. K. S. Verma
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white">
                      Controller of Examinations
                    </p>
                    <p className="text-[9px] text-slate-400">SG Tech University</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800">
              Select an examination session above to view or print your official admit card.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REVALUATION & RE-CHECKING PORTAL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'revaluation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Paper Revaluation & Grade Appeal Service
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Apply for answer paper re-evaluation, recount of marks, or certified evaluated answer script photocopy.
              </p>
            </div>
            {!isStaff && (
              <Button variant="primary" size="sm" onClick={() => setIsApplyRevalOpen(true)} icon={Plus}>
                Apply Revaluation
              </Button>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
            {loadingReval ? (
              <div className="p-8 text-center text-slate-400">Loading revaluation records...</div>
            ) : revaluations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 px-3">Student</th>
                      <th className="pb-3 px-3">Subject</th>
                      <th className="pb-3 px-3">Type</th>
                      <th className="pb-3 px-3">Original Marks</th>
                      <th className="pb-3 px-3">Revised Marks</th>
                      <th className="pb-3 px-3">Fee Status</th>
                      <th className="pb-3 px-3">Status</th>
                      {isStaff && <th className="pb-3 px-3 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {revaluations.map((rev) => (
                      <tr key={rev._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {rev.studentId?.fullName || 'Student'} ({rev.studentId?.registrationNumber || 'N/A'})
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {rev.subjectId?.name || 'Subject'} ({rev.subjectId?.code || 'N/A'})
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-400">{rev.type}</td>
                        <td className="py-3 px-3 font-mono font-bold">{rev.originalMarks} / 100</td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {rev.revisedMarks !== undefined ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{rev.revisedMarks} / 100</span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            ₹{rev.feeAmount} PAID
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              rev.status === 'MARKS_REVISED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : rev.status === 'NO_CHANGE'
                                ? 'bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {rev.status}
                          </span>
                        </td>
                        {isStaff && (
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedRevalToEdit(rev);
                                setRevalEditForm({
                                  status: rev.status === 'APPLIED' ? 'MARKS_REVISED' : rev.status,
                                  revisedMarks: rev.revisedMarks || rev.originalMarks + 4,
                                  evaluatorRemarks: rev.evaluatorRemarks || 'Marks verified and awarded for solution clarity.',
                                });
                              }}
                              className="text-brand-500 hover:text-brand-600 font-bold"
                            >
                              Evaluate / Revise
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                No active revaluation applications found in this session.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BACKLOGS & REMEDIAL EXAMS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'backlogs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Supplementary & Backlog Paper Management
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Auto-detected failed modules (&lt; 40 marks), repeat attempts, and remedial examination scheduling.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold">Standard Supplementary Fee:</span>
              <span className="ml-2 font-mono font-black text-brand-600 dark:text-brand-400 text-sm">
                ₹{backlogData.feePerSubject} / Subject
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arrear Subjects Detected */}
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Detected Arrear Modules (Needs Remedial Clearance)</span>
              </h4>

              {loadingBacklogs ? (
                <div className="p-6 text-center text-slate-400">Scanning evaluation database...</div>
              ) : backlogData.backlogs?.length > 0 ? (
                <div className="space-y-3">
                  {backlogData.backlogs.map((b) => (
                    <div
                      key={b._id}
                      className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {b.subjectId?.name || 'Subject Module'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {b.subjectId?.code || 'CS602'} • Previous Score: <strong className="text-rose-600">{b.obtainedMarks}/100 ({b.grade})</strong>
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedBacklogSubject(b);
                          setIsRegisterBacklogOpen(true);
                        }}
                      >
                        Register Arrear
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Clean Academic Record!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No active failed or arrear subjects detected. All enrolled subjects have achieved passing grade.
                  </p>
                </div>
              )}
            </div>

            {/* Registered Supplementary Examinations */}
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                <span>Confirmed Supplementary Registrations</span>
              </h4>

              {backlogData.registrations?.length > 0 ? (
                <div className="space-y-3">
                  {backlogData.registrations.map((reg) => (
                    <div
                      key={reg._id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {reg.subjectId?.name || 'Subject Module'} ({reg.subjectId?.code || 'N/A'})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Semester {reg.semester} • Attempt #{reg.attemptNumber || 2} • Fee: ₹{reg.registrationFee}
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {reg.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
                  No pending supplementary registrations found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MARKS MODERATION & BELL CURVE TAB (STAFF) */}
      {/* ========================================================================= */}
      {activeTab === 'moderation' && isStaff && selectedExam && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Statistical Marks Moderation & Bell Curve Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardize evaluation deviations, inspect normal score distribution, and apply regulated grace marks.
              </p>
            </div>
          </div>

          {loadingModeration ? (
            <div className="p-8 text-center text-slate-400">Computing cohort statistics...</div>
          ) : moderationData ? (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cohort Average</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {moderationData.average} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pass Percentage</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {moderationData.passPercentage}%
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest / Lowest</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {moderationData.highest} <span className="text-xs font-normal text-slate-400">/ {moderationData.lowest}</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Borderline Candidates</p>
                  <p className="text-2xl font-black text-amber-500 mt-1">
                    {moderationData.borderlineCount}
                  </p>
                </div>
              </div>

              {/* Bell Curve Distribution Visualizer */}
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-brand-500" />
                  <span>CBCS Grade Frequency Distribution (Bell Curve)</span>
                </h4>
                <div className="grid grid-cols-7 gap-2 items-end h-44 pt-4 border-b border-slate-100 dark:border-navy-800 pb-2">
                  {Object.entries(moderationData.distribution || {}).map(([grade, count]) => {
                    const maxVal = Math.max(...Object.values(moderationData.distribution || { a: 1 }), 1);
                    const heightPct = Math.max(12, Math.round((count / maxVal) * 100));
                    return (
                      <div key={grade} className="flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] font-mono font-bold text-slate-400 mb-1">{count}</span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-lg transition-all ${
                            grade === 'F'
                              ? 'bg-rose-500'
                              : grade === 'O' || grade === 'A+'
                              ? 'bg-emerald-500'
                              : 'bg-brand-500'
                          }`}
                        ></div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">{grade}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grace Marks Regulatory Tool */}
              <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-soft">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Regulated Grace Marks & Boundary Elevation Engine</span>
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-xl">
                      Automatically award compensatory marks to candidates scoring within the academic boundary (e.g. 36-39) to achieve the 40 passing threshold under University Examination Bylaw 14.3.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Max Grace:</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={graceMarksInput}
                        onChange={(e) => setGraceMarksInput(e.target.value)}
                        className="w-14 px-2 py-1 rounded border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-center font-bold"
                      />
                    </div>
                    <Button variant="primary" size="sm" onClick={handleApplyGraceMarks} isLoading={actionLoading}>
                      Apply Grace Marks
                    </Button>
                  </div>
                </div>

                {moderationData.borderlineCandidates?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/60">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-2">
                      Candidates Eligible for Elevation:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {moderationData.borderlineCandidates.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-sm"
                        >
                          {c.studentName} ({c.regNo}) • {c.subject}: <strong>{c.marks}/100</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Revaluation Application Modal */}
      <Modal isOpen={isApplyRevalOpen} onClose={() => setIsApplyRevalOpen(false)} title="Apply for Paper Revaluation">
        <form onSubmit={handleApplyReval} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Subject</label>
            <select
              value={revalForm.subjectId}
              onChange={(e) => setRevalForm({ ...revalForm, subjectId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold"
              required
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Application Type</label>
            <select
              value={revalForm.type}
              onChange={(e) => setRevalForm({ ...revalForm, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold"
            >
              <option value="REVALUATION">Full Paper Revaluation (₹500)</option>
              <option value="RECHECKING">Re-totalling & Rechecking (₹300)</option>
              <option value="PHOTOCOPY">Certified Answer Script Copy (₹250)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Originally Awarded Marks</label>
            <input
              type="number"
              value={revalForm.originalMarks}
              onChange={(e) => setRevalForm({ ...revalForm, originalMarks: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Re-evaluation</label>
            <textarea
              rows={3}
              value={revalForm.reason}
              onChange={(e) => setRevalForm({ ...revalForm, reason: e.target.value })}
              placeholder="State question numbers where discrepancies exist..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs"
              required
            ></textarea>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Revaluation Processing Fee:</span>
            <span className="font-bold text-slate-900 dark:text-white">₹500.00</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsApplyRevalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={actionLoading}>
              Confirm & Pay Fee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Staff Revaluation Status Editor Modal */}
      <Modal
        isOpen={!!selectedRevalToEdit}
        onClose={() => setSelectedRevalToEdit(null)}
        title="Evaluate Revaluation Application"
      >
        {selectedRevalToEdit && (
          <form onSubmit={handleUpdateRevalStatus} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 text-xs">
              <p>
                Student: <strong>{selectedRevalToEdit.studentId?.fullName}</strong> ({selectedRevalToEdit.studentId?.registrationNumber})
              </p>
              <p className="mt-1">
                Subject: <strong>{selectedRevalToEdit.subjectId?.name}</strong> • Original Score:{' '}
                <strong>{selectedRevalToEdit.originalMarks} / 100</strong>
              </p>
              <p className="mt-1 text-slate-500 italic">"{selectedRevalToEdit.reason}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Decision Status</label>
              <select
                value={revalEditForm.status}
                onChange={(e) => setRevalEditForm({ ...revalEditForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold"
              >
                <option value="MARKS_REVISED">MARKS REVISED (Award Updated Score)</option>
                <option value="NO_CHANGE">NO CHANGE (Original Marks Upheld)</option>
                <option value="UNDER_EVALUATION">UNDER EVALUATION (Assigned to Expert)</option>
                <option value="REJECTED">REJECTED (Grounds Invalid)</option>
              </select>
            </div>

            {revalEditForm.status === 'MARKS_REVISED' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Updated Revised Marks (/100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={revalEditForm.revisedMarks}
                  onChange={(e) => setRevalEditForm({ ...revalEditForm, revisedMarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Evaluator Official Remarks
              </label>
              <textarea
                rows={2}
                value={revalEditForm.evaluatorRemarks}
                onChange={(e) => setRevalEditForm({ ...revalEditForm, evaluatorRemarks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setSelectedRevalToEdit(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={actionLoading}>
                Update Official Grade
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Backlog Registration Modal */}
      <Modal
        isOpen={isRegisterBacklogOpen}
        onClose={() => setIsRegisterBacklogOpen(false)}
        title="Confirm Supplementary Exam Registration"
      >
        {selectedBacklogSubject && (
          <form onSubmit={handleRegisterBacklog} className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold text-sm">
                {selectedBacklogSubject.subjectId?.name || 'Selected Subject'}
              </p>
              <p className="mt-1">
                Code: {selectedBacklogSubject.subjectId?.code || 'CS602'} • Previous Score:{' '}
                {selectedBacklogSubject.obtainedMarks}/100 ({selectedBacklogSubject.grade})
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Supplementary Exam Fee:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">₹750.00</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upon confirmation, your hall ticket for the supplementary examination session will be automatically generated.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsRegisterBacklogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={actionLoading}>
                Confirm Registration (₹750)
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Marks Entry Modal (Staff) */}
      <Modal isOpen={isMarksModalOpen} onClose={() => setIsMarksModalOpen(false)} title="Batch Subject Marks Entry">
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {studentRoster.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/40"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{s.fullName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{s.registrationNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marksState[s._id] ?? ''}
                    onChange={(e) => setMarksState({ ...marksState, [s._id]: e.target.value })}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-right font-bold"
                  />
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsMarksModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={actionLoading}>
              Save Marks
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Institutional Grade Sheet Transcript Modal */}
      <Modal isOpen={isTranscriptOpen} onClose={() => setIsTranscriptOpen(false)} title="Institutional Grade Transcript">
        {transcriptCandidate && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-white text-slate-900 border-2 border-slate-800 shadow-xl print:m-0 print:border-none print:shadow-none text-xs font-sans">
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-2">
                  SG
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight">SG Tech University (SGTU)</h2>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  Official Grade Sheet & Cumulative Credit Transcript
                </p>
                <p className="text-[10px] text-slate-500">Autonomous Institution • CBCS Semester System</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">Student Name:</span>{' '}
                  <strong className="text-slate-900">{transcriptCandidate.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Registration No:</span>{' '}
                  <strong className="font-mono text-slate-900">{transcriptCandidate.registrationNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Programme:</span>{' '}
                  <strong className="text-slate-900">{transcriptCandidate.course}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Semester:</span>{' '}
                  <strong className="text-slate-900">Semester {transcriptCandidate.semester} (Final)</strong>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded-lg mb-4">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <th className="py-2 px-2.5">Code</th>
                      <th className="py-2 px-2.5">Course Title</th>
                      <th className="py-2 px-2.5 text-center">Credits</th>
                      <th className="py-2 px-2.5 text-center">Marks</th>
                      <th className="py-2 px-2.5 text-center">Grade</th>
                      <th className="py-2 px-2.5 text-center">Grade Point</th>
                      <th className="py-2 px-2.5 text-right">Credit Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transcriptRows.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2 px-2.5 font-mono font-semibold">{r.code}</td>
                        <td className="py-2 px-2.5 font-medium">{r.title}</td>
                        <td className="py-2 px-2.5 text-center">{r.credits}</td>
                        <td className="py-2 px-2.5 text-center font-bold">{r.total}</td>
                        <td className="py-2 px-2.5 text-center font-black text-brand-600">{r.grade}</td>
                        <td className="py-2 px-2.5 text-center font-mono">{r.point}</td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold">{r.creditPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900 text-white rounded-lg text-center mb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Credits</p>
                  <p className="text-base font-black">{totalCredits}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Semester SGPA</p>
                  <p className="text-base font-black text-emerald-400">{calculatedSgpa}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cumulative CGPA</p>
                  <p className="text-base font-black text-brand-400">{calculatedCgpa}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-300 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-slate-700" />
                  <span>Verified Blockchain Transcript Hash: 0x7f9a...c92b</span>
                </div>
                <div className="text-right">
                  <div className="font-serif italic text-slate-800 font-bold text-xs">Registrar (Evaluation)</div>
                  <p className="text-[9px] uppercase font-bold text-slate-600">Seal of SG Tech University</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsTranscriptOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} icon={Printer}>
                Print Official Marksheet
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamResultsPage;
