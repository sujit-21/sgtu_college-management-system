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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

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
      const res = await api.post('/students', formData);
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
      const res = await api.patch(`/students/${selectedStudent._id}`, formData);
      if (res.data.success) {
        setIsEditOpen(false);
        setNotificationMsg('Student details updated.');
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

  const openEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.userId?.email || '',
      registrationNumber: student.registrationNumber,
      phone: student.phone,
      departmentId: student.departmentId?._id || '',
      courseId: student.courseId?._id || '',
      currentSemester: student.currentSemester,
      admissionYear: student.admissionYear,
      gender: student.gender || 'Male',
      dateOfBirth: student.dateOfBirth || '',
      address: student.address || '',
      bloodGroup: student.bloodGroup || 'O+',
      academicStatus: student.academicStatus || 'ACTIVE',
    });
    setIsEditOpen(true);
  };

  const exportCSV = () => {
    window.open(`${api.defaults.baseURL}/students/export/csv`, '_blank');
  };

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center shrink-0">
            {row.fullName.charAt(0)}
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
      header: 'Contact',
      render: (row) => (
        <div>
          <div className="text-slate-800 dark:text-slate-200">{row.userId?.email}</div>
          <div className="text-[11px] text-slate-400">{row.phone}</div>
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
      header: 'Status',
      render: (row) => <StatusBadge status={row.academicStatus} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
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
        description="Search, enroll, filter, and manage university students and academic records."
      >
        <Button variant="secondary" size="sm" onClick={exportCSV} icon={Download}>
          Export CSV
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setFormData(initialForm);
            setIsAddOpen(true);
          }}
          icon={Plus}
        >
          Enroll Student
        </Button>
      </PageHeader>

      {/* Success Notification Banner */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg('')}
            className="font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, reg ID, or phone..."
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        filters={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PROBATION">PROBATION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="GRADUATED">GRADUATED</option>
            </select>
          </div>
        }
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enroll New Student"
        subtitle="Fill in student academic and personal credentials."
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
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

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Student Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Record"
        subtitle={`Updating details for ${selectedStudent?.registrationNumber}`}
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
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

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Update Record
            </Button>
          </div>
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
