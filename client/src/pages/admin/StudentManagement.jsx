import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Search,
  Filter,
  Shield,
  Award,
  BookOpen,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [formTab, setFormTab] = useState('basic'); // 'basic' | 'identity' | 'academics'

  // Form State
  const initialForm = {
    fullName: '',
    email: '',
    registrationNumber: '',
    phone: '',
    departmentId: '',
    courseId: '',
    currentSemester: 1,
    admissionYear: 2026,
    gender: 'Male',
    dateOfBirth: '2004-01-01',
    address: '',
    bloodGroup: 'O+',
    academicStatus: 'ACTIVE',

    // Extended Student Data Section
    aadhaarNumber: '',
    caste: 'General',
    fatherName: '',
    motherName: '',
    emergencyContact: '',

    // 10th Marks & Record
    tenthMarks: '',
    tenthBoard: 'CBSE',
    tenthPassingYear: 2020,

    // 12th Marks & Record
    twelfthMarks: '',
    twelfthBoard: 'CBSE',
    twelfthPassingYear: 2022,
    twelfthStream: 'Science (PCM)',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
      });
      if (departmentFilter) params.append('departmentId', departmentFilter);
      if (courseFilter) params.append('courseId', courseFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, departmentFilter, courseFilter, statusFilter]);

  // Fetch departments and courses for dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, courseRes] = await Promise.all([
          api.get('/departments'),
          api.get('/courses'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (courseRes.data.success) setCourses(courseRes.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMetadata();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        tenthMarks: formData.tenthMarks ? parseFloat(formData.tenthMarks) : undefined,
        tenthPassingYear: formData.tenthPassingYear ? parseInt(formData.tenthPassingYear, 10) : undefined,
        twelfthMarks: formData.twelfthMarks ? parseFloat(formData.twelfthMarks) : undefined,
        twelfthPassingYear: formData.twelfthPassingYear ? parseInt(formData.twelfthPassingYear, 10) : undefined,
      };

      const res = await api.post('/students', payload);
      if (res.data.success) {
        setIsAddOpen(false);
        setFormData(initialForm);
        setNotificationMsg(`Student ${formData.fullName} created successfully.`);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        tenthMarks: formData.tenthMarks ? parseFloat(formData.tenthMarks) : undefined,
        tenthPassingYear: formData.tenthPassingYear ? parseInt(formData.tenthPassingYear, 10) : undefined,
        twelfthMarks: formData.twelfthMarks ? parseFloat(formData.twelfthMarks) : undefined,
        twelfthPassingYear: formData.twelfthPassingYear ? parseInt(formData.twelfthPassingYear, 10) : undefined,
      };

      const res = await api.patch(`/students/${selectedStudent._id}`, payload);
      if (res.data.success) {
        setIsEditOpen(false);
        setNotificationMsg('Student details updated successfully.');
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/students/${selectedStudent._id}`);
      if (res.data.success) {
        setIsDeleteOpen(false);
        setNotificationMsg('Student account has been deactivated.');
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate student.');
    } finally {
      setActionLoading(false);
    }
  };

  const openView = (student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName || '',
      email: student.userId?.email || '',
      registrationNumber: student.registrationNumber || '',
      phone: student.phone || '',
      departmentId: student.departmentId?._id || '',
      courseId: student.courseId?._id || '',
      currentSemester: student.currentSemester || 1,
      admissionYear: student.admissionYear || 2026,
      gender: student.gender || 'Male',
      dateOfBirth: student.dateOfBirth || '',
      address: student.address || '',
      bloodGroup: student.bloodGroup || 'O+',
      academicStatus: student.academicStatus || 'ACTIVE',

      // Extended Data Fields
      aadhaarNumber: student.aadhaarNumber || '',
      caste: student.caste || 'General',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      emergencyContact: student.emergencyContact || '',

      // 10th & 12th Marks
      tenthMarks: student.tenthMarks !== undefined ? student.tenthMarks : '',
      tenthBoard: student.tenthBoard || 'CBSE',
      tenthPassingYear: student.tenthPassingYear || 2020,
      twelfthMarks: student.twelfthMarks !== undefined ? student.twelfthMarks : '',
      twelfthBoard: student.twelfthBoard || 'CBSE',
      twelfthPassingYear: student.twelfthPassingYear || 2022,
      twelfthStream: student.twelfthStream || 'Science (PCM)',
    });
    setFormTab('basic');
    setIsEditOpen(true);
  };

  const exportCSV = () => {
    window.open(`${api.defaults.baseURL}/students/export/csv`, '_blank');
  };

  const getCasteBadgeColor = (caste) => {
    switch (caste) {
      case 'General':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'OBC':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'SC':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ST':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'EWS':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center shrink-0">
            {row.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white leading-tight">
              {row.fullName}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {row.registrationNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category & Aadhaar',
      render: (row) => (
        <div className="space-y-1">
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCasteBadgeColor(
              row.caste || 'General'
            )}`}
          >
            {row.caste || 'General'}
          </span>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {row.aadhaarNumber ? `UIDAI: •••• ${row.aadhaarNumber.slice(-4)}` : 'Aadhaar Pending'}
          </div>
        </div>
      ),
    },
    {
      header: 'Program & Semester',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {row.courseId?.code || 'N/A'}
          </div>
          <div className="text-[11px] text-slate-400">
            Sem {row.currentSemester} • {row.departmentId?.code}
          </div>
        </div>
      ),
    },
    {
      header: 'Prior Academic Record',
      render: (row) => (
        <div className="text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">10th:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {row.tenthMarks ? `${row.tenthMarks}%` : '—'}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 ml-1">12th:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {row.twelfthMarks ? `${row.twelfthMarks}%` : '—'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {row.twelfthStream || 'Senior Secondary'}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.academicStatus} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openView(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="View student dossier"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="Edit student"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStudent(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="Deactivate student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory & Admissions"
        description="Comprehensive repository of student academic credentials, government IDs, caste category, and high-school records."
      >
        <Button variant="secondary" size="sm" onClick={exportCSV} icon={Download}>
          Export CSV
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setFormData(initialForm);
            setFormTab('basic');
            setIsAddOpen(true);
          }}
          icon={Plus}
        >
          Enroll Student
        </Button>
      </PageHeader>

      {/* Notifications */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg('')}
            className="text-[11px] font-bold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, roll no, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code}
              </option>
            ))}
          </select>

          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PROBATION">PROBATION</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="GRADUATED">GRADUATED</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPage(p),
        }}
        emptyMessage="No students found matching your criteria."
      />

      {/* View Student Dossier Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Student Identity & Credentials Dossier"
        subtitle={`Registration ID: ${selectedStudent?.registrationNumber}`}
      >
        {selectedStudent && (
          <div className="space-y-5 text-xs">
            {/* Header / Profile Summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <div className="w-14 h-14 rounded-full bg-brand-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {selectedStudent.fullName?.charAt(0) || 'S'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedStudent.fullName}
                  </h4>
                  <StatusBadge status={selectedStudent.academicStatus} />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCasteBadgeColor(
                      selectedStudent.caste || 'General'
                    )}`}
                  >
                    Category: {selectedStudent.caste || 'General'}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                  <span>{selectedStudent.courseId?.name} ({selectedStudent.courseId?.code})</span>
                  <span>•</span>
                  <span>Semester {selectedStudent.currentSemester}</span>
                  <span>•</span>
                  <span>{selectedStudent.departmentId?.name}</span>
                </div>
              </div>
            </div>

            {/* Section 1: Government Identity & Family Information */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold border-b border-slate-100 dark:border-navy-800 pb-2">
                <Shield className="w-4 h-4" />
                <span>Government Identity & Social Category</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                  <span className="text-[10px] text-slate-400 block font-semibold">Aadhaar Card Number</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedStudent.aadhaarNumber || 'Not Provided / Pending'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                  <span className="text-[10px] text-slate-400 block font-semibold">Social / Caste Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedStudent.caste || 'General'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                  <span className="text-[10px] text-slate-400 block font-semibold">Father's Name</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedStudent.fatherName || 'Not recorded'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                  <span className="text-[10px] text-slate-400 block font-semibold">Mother's Name</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedStudent.motherName || 'Not recorded'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-semibold">Emergency Guardian Phone</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedStudent.emergencyContact || selectedStudent.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Previous Board Qualifications (10th / 12th) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold border-b border-slate-100 dark:border-navy-800 pb-2">
                <Award className="w-4 h-4" />
                <span>Pre-University Academic Qualifications</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 10th Record */}
                <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-blue-300">10th Secondary (Matric)</span>
                    <span className="text-sm font-black text-brand-600 dark:text-brand-400 bg-white dark:bg-navy-900 px-2 py-0.5 rounded-md shadow-xs">
                      {selectedStudent.tenthMarks ? `${selectedStudent.tenthMarks}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div><span className="text-slate-400">Board:</span> {selectedStudent.tenthBoard || 'CBSE'}</div>
                    <div><span className="text-slate-400">Year of Passing:</span> {selectedStudent.tenthPassingYear || '2020'}</div>
                  </div>
                </div>

                {/* 12th Record */}
                <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300">12th Senior Secondary</span>
                    <span className="text-sm font-black text-brand-600 dark:text-brand-400 bg-white dark:bg-navy-900 px-2 py-0.5 rounded-md shadow-xs">
                      {selectedStudent.twelfthMarks ? `${selectedStudent.twelfthMarks}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div><span className="text-slate-400">Board:</span> {selectedStudent.twelfthBoard || 'CBSE'}</div>
                    <div><span className="text-slate-400">Stream:</span> {selectedStudent.twelfthStream || 'Science (PCM)'}</div>
                    <div><span className="text-slate-400">Year of Passing:</span> {selectedStudent.twelfthPassingYear || '2022'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Address */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
              <div className="text-slate-500 font-bold border-b border-slate-100 dark:border-navy-800 pb-2">
                Contact & Address
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div><span className="text-slate-400">Email:</span> {selectedStudent.userId?.email}</div>
                <div><span className="text-slate-400">Phone:</span> {selectedStudent.phone}</div>
                <div><span className="text-slate-400">DOB:</span> {selectedStudent.dateOfBirth || 'N/A'}</div>
                <div><span className="text-slate-400">Blood Group:</span> {selectedStudent.bloodGroup || 'N/A'}</div>
                <div className="sm:col-span-2"><span className="text-slate-400">Address:</span> {selectedStudent.address || 'N/A'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enroll New Student"
        subtitle="Complete enrollment registration including Government Aadhaar, Caste, and 10th/12th academic dossier."
      >
        {/* Modal Form Tabs */}
        <div className="flex border-b border-slate-200 dark:border-navy-800 mb-4 gap-2">
          <button
            type="button"
            onClick={() => setFormTab('basic')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'basic'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            1. Basic & Academic
          </button>
          <button
            type="button"
            onClick={() => setFormTab('identity')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'identity'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            2. Aadhaar & Caste
          </button>
          <button
            type="button"
            onClick={() => setFormTab('academics')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'academics'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            3. 10th & 12th Marks
          </button>
        </div>

        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College Registration ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g. SGTU-2026-CS99"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul.sharma@sgtu.edu"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 99887 76655"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Program *
                  </label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City, State"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('identity')}>
                  Next: Aadhaar & Caste →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'identity' && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Government identification and statutory caste reservation credentials.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="1234-5678-9012"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Caste Category *
                  </label>
                  <select
                    value={formData.caste}
                    onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  >
                    <option value="General">General (Unreserved)</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Father / Guardian Full Name"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="Mother Full Name"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="+91 98450 XXXXX"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('basic')}>
                  ← Back
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('academics')}>
                  Next: 10th & 12th Marks →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'academics' && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2">
                <Award className="w-4 h-4 shrink-0" />
                <span>Pre-admission board examinations scores and secondary academic record.</span>
              </div>

              {/* 10th Record Group */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  10th Secondary School Examination
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Marks / Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.tenthMarks}
                      onChange={(e) => setFormData({ ...formData, tenthMarks: e.target.value })}
                      placeholder="e.g. 94.6"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Board of Examination
                    </label>
                    <input
                      type="text"
                      value={formData.tenthBoard}
                      onChange={(e) => setFormData({ ...formData, tenthBoard: e.target.value })}
                      placeholder="CBSE / ICSE / State"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Year of Passing
                    </label>
                    <input
                      type="number"
                      min="2010"
                      max="2030"
                      value={formData.tenthPassingYear}
                      onChange={(e) => setFormData({ ...formData, tenthPassingYear: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* 12th Record Group */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  12th Senior Secondary / Higher Secondary
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Marks / Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.twelfthMarks}
                      onChange={(e) => setFormData({ ...formData, twelfthMarks: e.target.value })}
                      placeholder="e.g. 92.4"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Stream / Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.twelfthStream}
                      onChange={(e) => setFormData({ ...formData, twelfthStream: e.target.value })}
                      placeholder="Science (PCM) / Commerce"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Board of Examination
                    </label>
                    <input
                      type="text"
                      value={formData.twelfthBoard}
                      onChange={(e) => setFormData({ ...formData, twelfthBoard: e.target.value })}
                      placeholder="CBSE / ISC / State"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Year of Passing
                    </label>
                    <input
                      type="number"
                      min="2010"
                      max="2030"
                      value={formData.twelfthPassingYear}
                      onChange={(e) => setFormData({ ...formData, twelfthPassingYear: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('identity')}>
                  ← Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={actionLoading}>
                    Save Complete Record
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Record"
        subtitle={`Updating credentials for ${selectedStudent?.registrationNumber}`}
      >
        {/* Modal Form Tabs */}
        <div className="flex border-b border-slate-200 dark:border-navy-800 mb-4 gap-2">
          <button
            type="button"
            onClick={() => setFormTab('basic')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'basic'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            1. Basic & Status
          </button>
          <button
            type="button"
            onClick={() => setFormTab('identity')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'identity'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            2. Aadhaar & Caste
          </button>
          <button
            type="button"
            onClick={() => setFormTab('academics')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'academics'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            3. 10th & 12th Marks
          </button>
        </div>

        <form onSubmit={handleUpdateStudent} className="space-y-4">
          {formTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Status
                  </label>
                  <select
                    value={formData.academicStatus}
                    onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PROBATION">PROBATION</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="GRADUATED">GRADUATED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('identity')}>
                  Next: Aadhaar & Caste →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'identity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="1234-5678-9012"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Caste Category
                  </label>
                  <select
                    value={formData.caste}
                    onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  >
                    <option value="General">General (Unreserved)</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('basic')}>
                  ← Back
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('academics')}>
                  Next: 10th & 12th Marks →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'academics' && (
            <div className="space-y-4">
              {/* 10th Record Group */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  10th Secondary School Examination
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Marks / Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.tenthMarks}
                      onChange={(e) => setFormData({ ...formData, tenthMarks: e.target.value })}
                      placeholder="e.g. 94.6"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Board of Examination
                    </label>
                    <input
                      type="text"
                      value={formData.tenthBoard}
                      onChange={(e) => setFormData({ ...formData, tenthBoard: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Year of Passing
                    </label>
                    <input
                      type="number"
                      min="2010"
                      max="2030"
                      value={formData.tenthPassingYear}
                      onChange={(e) => setFormData({ ...formData, tenthPassingYear: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* 12th Record Group */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  12th Senior Secondary / Higher Secondary
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Marks / Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.twelfthMarks}
                      onChange={(e) => setFormData({ ...formData, twelfthMarks: e.target.value })}
                      placeholder="e.g. 92.4"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Stream / Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.twelfthStream}
                      onChange={(e) => setFormData({ ...formData, twelfthStream: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Board of Examination
                    </label>
                    <input
                      type="text"
                      value={formData.twelfthBoard}
                      onChange={(e) => setFormData({ ...formData, twelfthBoard: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Year of Passing
                    </label>
                    <input
                      type="number"
                      min="2010"
                      max="2030"
                      value={formData.twelfthPassingYear}
                      onChange={(e) => setFormData({ ...formData, twelfthPassingYear: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('identity')}>
                  ← Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={actionLoading}>
                    Update Record
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Confirmation Dialog for Deactivation */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate student ${selectedStudent?.fullName} (${selectedStudent?.registrationNumber})? Their portal access will be revoked.`}
        confirmText="Deactivate Student"
        isLoading={actionLoading}
      />
    </div>
  );
};
export default StudentManagement;
