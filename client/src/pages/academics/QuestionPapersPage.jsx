import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Eye,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Building2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const QuestionPapersPage = () => {
  const { user } = useAuth();
  const isFacultyOrAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';

  const [papers, setPapers] = useState([]);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalDownloads: 0,
    withSolutionsCount: 0,
    totalDepartments: 4,
  });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedExamType, setSelectedExamType] = useState('ALL');
  const [onlyWithSolutions, setOnlyWithSolutions] = useState(false);

  // Modal states
  const [previewPaper, setPreviewPaper] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Upload form state
  const initialForm = {
    departmentCode: 'CSE',
    departmentName: 'Computer Science & Engineering',
    courseCode: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    semester: 6,
    subjectCode: '',
    subjectName: '',
    examType: 'End-Semester Examination',
    academicYear: '2024-25',
    maxMarks: 100,
    durationHours: 3,
    hasAnswerKey: true,
    fileSize: '1.5 MB',
    instructions: 'Answer any FIVE full questions choosing one full question from each module. Non-programmable scientific calculators permitted.',
    sampleQuestions: [
      {
        section: 'Module 1',
        sectionName: 'Module 1 - Architecture & Foundations',
        marks: 20,
        questionText: '',
      },
    ],
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchQuestionPapers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (selectedSemester !== 'ALL') params.append('semester', selectedSemester);
      if (selectedYear !== 'ALL') params.append('academicYear', selectedYear);
      if (selectedExamType !== 'ALL') params.append('examType', selectedExamType);
      if (search.trim()) params.append('search', search.trim());
      if (onlyWithSolutions) params.append('hasAnswerKey', 'true');

      const res = await api.get(`/question-papers?${params.toString()}`);
      if (res.data.success) {
        setPapers(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch question papers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionPapers();
  }, [selectedDept, selectedSemester, selectedYear, selectedExamType, onlyWithSolutions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestionPapers();
  };

  const handleDownload = async (paper) => {
    setDownloadingId(paper._id);
    try {
      const res = await api.post(`/question-papers/${paper._id}/download`);
      if (res.data.success) {
        // Update local count
        setPapers((prev) =>
          prev.map((p) =>
            p._id === paper._id ? { ...p, downloadCount: (p.downloadCount || 0) + 1 } : p
          )
        );
        setStats((prev) => ({
          ...prev,
          totalDownloads: (prev.totalDownloads || 0) + 1,
        }));

        // Trigger simulated PDF download / open
        const downloadUrl = res.data.fileUrl || paper.fileUrl;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${paper.departmentCode}_${paper.subjectCode}_${paper.academicYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (paperId) => {
    if (!window.confirm('Are you sure you want to delete this question paper archive?')) return;
    try {
      const res = await api.delete(`/question-papers/${paperId}`);
      if (res.data.success) {
        setPapers((prev) => prev.filter((p) => p._id !== paperId));
      }
    } catch (error) {
      console.error('Failed to delete question paper:', error);
    }
  };

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/question-papers', formData);
      if (res.data.success) {
        setIsUploadOpen(false);
        setFormData(initialForm);
        fetchQuestionPapers();
      }
    } catch (error) {
      console.error('Failed to create question paper:', error);
      alert('Error creating question paper. Please verify all required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedDept('ALL');
    setSelectedSemester('ALL');
    setSelectedYear('ALL');
    setSelectedExamType('ALL');
    setOnlyWithSolutions(false);
  };

  // Exam type badge style helper
  const getExamTypeBadge = (type) => {
    if (type.includes('End-Semester') || type === 'END_SEM') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (type.includes('Mid-Term') || type === 'MID_TERM') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (type.includes('Model') || type === 'MODEL_PAPER') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  };

  const formatExamTypeName = (type) => {
    if (type === 'END_SEM') return 'End-Semester Examination';
    if (type === 'MID_TERM') return 'Mid-Term Sessional';
    if (type === 'MODEL_PAPER') return 'Model University Paper';
    if (type === 'SUPPLEMENTARY') return 'Supplementary / Backlog';
    return type;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Previous Year Question Papers (PYQ)"
        subtitle="Search, preview, and download official university examination question papers and model solution archives across all engineering departments."
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchQuestionPapers}
            className="flex items-center gap-2 border-slate-300 dark:border-navy-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isFacultyOrAdmin && (
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary hover:bg-primary-600 text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Upload Question Paper
            </Button>
          )}
        </div>
      </PageHeader>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalPapers || papers.length}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Exam Papers Archived
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(stats.totalDownloads || 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Student Downloads
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              4 Departments
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              CSE, ECE, ME, Civil
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.withSolutionsCount || 8}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Papers with Answer Keys
            </div>
          </div>
        </div>
      </div>

      {/* Multi-facet Filter & Search Bar */}
      <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject name, course code (e.g. CS601, Algorithms, Cloud, AI)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary-600 text-white shrink-0">
            Search Papers
          </Button>
          {(search || selectedDept !== 'ALL' || selectedSemester !== 'ALL' || selectedYear !== 'ALL' || selectedExamType !== 'ALL' || onlyWithSolutions) && (
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-navy-700 shrink-0"
            >
              Reset Filters
            </Button>
          )}
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-navy-800">
          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="ME">Mechanical (ME)</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Years</option>
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Exam Type
            </label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Exam Types</option>
              <option value="END_SEM">End-Semester Examination</option>
              <option value="MID_TERM">Mid-Term Sessional</option>
              <option value="MODEL_PAPER">Model University Paper</option>
              <option value="SUPPLEMENTARY">Supplementary / Backlog</option>
            </select>
          </div>

          {/* Solutions Checkbox */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 p-2 w-full rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors">
              <input
                type="checkbox"
                checked={onlyWithSolutions}
                onChange={(e) => setOnlyWithSolutions(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span>With Solutions Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Question Papers List */}
      {loading ? (
        <div className="bg-white dark:bg-navy-900 rounded-xl p-12 text-center border border-slate-200 dark:border-navy-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Fetching previous year exam papers from university archive...
          </p>
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 rounded-xl p-12 text-center border border-slate-200 dark:border-navy-800">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            No Question Papers Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            No past examination papers match your current filter selections. Try broadening your criteria or reset the search.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map((paper) => (
            <div
              key={paper._id}
              className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="p-5">
                {/* Header row: Department & Exam Type */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700">
                    {paper.departmentCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getExamTypeBadge(
                      paper.examType
                    )}`}
                  >
                    {formatExamTypeName(paper.examType)}
                  </span>
                </div>

                {/* Subject Name and Code */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {paper.subjectName}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Code: <span className="font-semibold text-slate-700 dark:text-slate-300">{paper.subjectCode}</span> &bull; {paper.departmentName}
                </p>

                {/* Key Tags Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-navy-800/60 p-3 rounded-lg border border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Sem {paper.semester} &bull; {paper.academicYear}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{paper.durationHours || 3} Hours</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Max {paper.maxMarks || 100} Marks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{paper.fileSize || '1.5 MB'}</span>
                  </div>
                </div>

                {/* Badges: Answer Key & Downloads */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {paper.hasAnswerKey ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Solutions Included
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Question Paper Only</span>
                  )}
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {paper.downloadCount || 0} downloads
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-navy-800/40 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between rounded-b-xl gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewPaper(paper)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-700"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleDownload(paper)}
                  disabled={downloadingId === paper._id}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-primary hover:bg-primary-600 text-white shadow-sm"
                >
                  <Download className={`w-3.5 h-3.5 ${downloadingId === paper._id ? 'animate-bounce' : ''}`} />
                  Download PDF
                </Button>

                {isFacultyOrAdmin && (
                  <button
                    onClick={() => handleDelete(paper._id)}
                    title="Delete Paper"
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Question Paper Live Preview Modal */}
      {previewPaper && (
        <Modal
          isOpen={!!previewPaper}
          onClose={() => setPreviewPaper(null)}
          title={`Question Paper Preview - ${previewPaper.subjectCode}`}
        >
          <div className="space-y-5 text-slate-800 dark:text-slate-200">
            {/* University Examination Header Block */}
            <div className="p-5 border-2 border-slate-800 dark:border-slate-300 rounded-lg bg-slate-50/50 dark:bg-navy-800/50 text-center space-y-1.5">
              <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                SG Tech University (SGTU) &bull; Smart Generation CMS
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                Faculty of Engineering &amp; Technology
              </h2>
              <div className="text-xs font-bold text-primary uppercase">
                {formatExamTypeName(previewPaper.examType)} &bull; Academic Year {previewPaper.academicYear}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 pt-1">
                Course: {previewPaper.courseName} ({previewPaper.courseCode}) &bull; Semester {previewPaper.semester}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Subject: {previewPaper.subjectName} [{previewPaper.subjectCode}]
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300">
                <span>Time Allowed: {previewPaper.durationHours || 3} Hours</span>
                <span>Max. Marks: {previewPaper.maxMarks || 100}</span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3.5 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                General Examination Instructions:
              </span>
              <p className="pl-5 leading-relaxed">
                {previewPaper.instructions ||
                  '1. Answer any FIVE full questions choosing one full question from each module.\n2. Use of non-programmable scientific calculators is permitted.\n3. Assume suitable missing data if any.'}
              </p>
            </div>

            {/* Sample Questions / Sections List */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Examination Paper Sections &amp; Marks Distribution
              </div>

              {previewPaper.sampleQuestions && previewPaper.sampleQuestions.length > 0 ? (
                previewPaper.sampleQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-primary">
                      <span>{q.sectionName || q.section || `Question ${idx + 1}`}</span>
                      <span className="bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                        [{q.marks || 20} Marks]
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 text-xs text-slate-500 text-center">
                  Full question paper is available in the verified PDF document archive.
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-navy-700">
              <div className="text-xs text-slate-500">
                Uploaded by: <span className="font-semibold text-slate-700 dark:text-slate-300">{previewPaper.uploadedBy}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewPaper(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => handleDownload(previewPaper)}
                  className="bg-primary hover:bg-primary-600 text-white flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download Official PDF
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Question Paper Modal for Faculty / Admins */}
      {isUploadOpen && (
        <Modal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          title="Archive New Question Paper"
        >
          <form onSubmit={handleCreatePaper} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department Code *
                </label>
                <select
                  value={formData.departmentCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    let name = 'Computer Science & Engineering';
                    if (code === 'ECE') name = 'Electronics & Communication Engineering';
                    if (code === 'ME') name = 'Mechanical Engineering';
                    if (code === 'Civil') name = 'Civil Engineering';
                    setFormData({ ...formData, departmentCode: code, departmentName: name });
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semester (1-8) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Code * (e.g. CS603)
                </label>
                <input
                  type="text"
                  placeholder="CS603"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="Software Engineering & Agile"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Type *
                </label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                >
                  <option value="End-Semester Examination">End-Semester</option>
                  <option value="Mid-Term Sessional">Mid-Term</option>
                  <option value="Model University Paper">Model Paper</option>
                  <option value="Supplementary / Backlog">Supplementary</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year *
                </label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Marks
                </label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value, 10) })}
                  className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Examination Instructions
              </label>
              <textarea
                rows={2}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sample Question for Live Preview
              </label>
              <textarea
                rows={2}
                placeholder="Enter sample question text for the student preview modal..."
                value={formData.sampleQuestions[0]?.questionText || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sampleQuestions: [
                      {
                        section: 'Module 1',
                        sectionName: 'Module 1 - Architecture & Foundations',
                        marks: 20,
                        questionText: e.target.value,
                      },
                    ],
                  })
                }
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hasAnswerKey"
                checked={formData.hasAnswerKey}
                onChange={(e) => setFormData({ ...formData, hasAnswerKey: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="hasAnswerKey" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Verified Answer Key / Solution Guide attached
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-700">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary-600 text-white">
                {submitting ? 'Archiving...' : 'Upload & Archive Paper'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default QuestionPapersPage;
