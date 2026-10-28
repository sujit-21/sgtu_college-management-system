import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  Award,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const AssignmentPage = () => {
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Teacher Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Student Submit Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [submitFileUrl, setSubmitFileUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // New assignment form
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subjectId: '',
    courseId: '',
    semester: 6,
    dueDate: '',
    totalMarks: 50,
  });

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    if (isTeacherOrAdmin) {
      const fetchMeta = async () => {
        try {
          const [subRes, courseRes] = await Promise.all([
            api.get('/subjects'),
            api.get('/courses'),
          ]);
          if (subRes.data.success) setSubjects(subRes.data.data);
          if (courseRes.data.success) setCourses(courseRes.data.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchMeta();
    }
  }, [isTeacherOrAdmin]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/assignments', newAssignment);
      if (res.data.success) {
        setIsCreateOpen(false);
        setNewAssignment({
          title: '',
          description: '',
          subjectId: '',
          courseId: '',
          semester: 6,
          dueDate: '',
          totalMarks: 50,
        });
        loadAssignments();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsOpen(true);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    try {
      const res = await api.patch(`/assignments/submissions/${gradingSubmission._id}/grade`, {
        obtainedMarks: marksInput,
        feedback: feedbackInput,
      });
      if (res.data.success) {
        setGradingSubmission(null);
        openSubmissions(selectedAssignment);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to grade submission.');
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        submissionText: submitText,
        fileUrl: submitFileUrl,
      });
      if (res.data.success) {
        setIsSubmitOpen(false);
        setSubmitText('');
        setSubmitFileUrl('');
        loadAssignments();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coursework & Assignments"
        description="Deliver, track, submit, and evaluate academic lab exercises and project work."
      >
        {isTeacherOrAdmin && (
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} icon={Plus}>
            New Assignment
          </Button>
        )}
      </PageHeader>

      {/* Assignment List Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs text-slate-400">
          No assignments active at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map((assignment) => {
            const isDuePassed = new Date(assignment.dueDate) < new Date();
            const mySub = assignment.mySubmission;

            return (
              <div
                key={assignment._id}
                className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft card-elevated flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {assignment.subjectId?.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {assignment.totalMarks} Marks
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {assignment.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {assignment.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    {isDuePassed && <span className="text-red-500 font-semibold">Expired</span>}
                  </div>

                  {/* Student View: Submission Status */}
                  {!isTeacherOrAdmin && (
                    <div>
                      {mySub ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold mb-1">
                            <span>Status: {mySub.status}</span>
                            {mySub.obtainedMarks !== undefined && (
                              <span className="font-mono">
                                {mySub.obtainedMarks}/{assignment.totalMarks} Marks
                              </span>
                            )}
                          </div>
                          {mySub.feedback && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                              "{mySub.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsSubmitOpen(true);
                          }}
                          icon={Send}
                        >
                          Submit Coursework
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Teacher View: Manage Submissions */}
                  {isTeacherOrAdmin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => openSubmissions(assignment)}
                    >
                      View Submissions & Grade
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher: Create Assignment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Assignment"
        subtitle="Publish academic coursework with guidelines, due date, and point scale."
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              placeholder="e.g. Lab 5: Dynamic Programming & Longest Common Subsequence"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Subject *</label>
              <select
                required
                value={newAssignment.subjectId}
                onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Course Program *</label>
              <select
                required
                value={newAssignment.courseId}
                onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Due Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Total Marks</label>
              <input
                type="number"
                value={newAssignment.totalMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Instructions & Guidelines *</label>
            <textarea
              rows={4}
              required
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              placeholder="Provide instructions, rubric, and submission requirements..."
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Teacher: Submissions List Modal */}
      <Modal
        isOpen={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
        title={`Submissions: ${selectedAssignment?.title}`}
        subtitle={`${submissions.length} student submissions received`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No submissions submitted yet for this coursework.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {submissions.map((sub) => (
                <div key={sub._id} className="py-3 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sub.studentId?.fullName}
                      </span>
                      <span className="text-slate-400 ml-2 font-mono">
                        ({sub.studentId?.registrationNumber})
                      </span>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  {sub.submissionText && (
                    <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-950 p-2.5 rounded-xl">
                      {sub.submissionText}
                    </p>
                  )}

                  {sub.fileUrl && (
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Attached File / Repository</span>
                    </a>
                  )}

                  {/* Existing grade or grading button */}
                  {sub.status === 'GRADED' ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      <span>Awarded: <strong>{sub.obtainedMarks}</strong> Marks</span>
                      <span className="italic">{sub.feedback}</span>
                    </div>
                  ) : (
                    <div>
                      {gradingSubmission?._id === sub._id ? (
                        <form onSubmit={handleGradeSubmission} className="flex gap-2 items-center pt-2">
                          <input
                            type="number"
                            required
                            placeholder="Marks (e.g. 45)"
                            value={marksInput}
                            onChange={(e) => setMarksInput(e.target.value)}
                            className="w-28 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-navy-950 border rounded-xl"
                          />
                          <input
                            type="text"
                            placeholder="Feedback comments..."
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-navy-950 border rounded-xl"
                          />
                          <Button variant="primary" size="sm" type="submit">
                            Save Grade
                          </Button>
                        </form>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setGradingSubmission(sub);
                            setMarksInput('');
                            setFeedbackInput('');
                          }}
                        >
                          Grade Submission
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Student: Submit Assignment Modal */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="Submit Coursework"
        subtitle={`Submitting for: ${selectedAssignment?.title}`}
      >
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Submission Comments / Summary *
            </label>
            <textarea
              rows={4}
              required
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
              placeholder="Explain your approach, testing results, and methodology..."
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              File URL / GitHub Repository Link
            </label>
            <input
              type="url"
              value={submitFileUrl}
              onChange={(e) => setSubmitFileUrl(e.target.value)}
              placeholder="https://github.com/my-name/coursework or storage link"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsSubmitOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading} icon={Send}>
              Confirm & Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
