import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  BookOpen,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

export const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    fullName: '',
    email: '',
    employeeId: '',
    phone: '',
    designation: 'Assistant Professor',
    qualification: 'M.Tech / Ph.D',
    specialization: '',
    departmentId: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers');
      if (res.data.success) {
        setTeachers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDepts();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/teachers', formData);
      if (res.data.success) {
        setIsAddOpen(false);
        setFormData(initialForm);
        fetchTeachers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/teachers/${selectedTeacher._id}`, formData);
      if (res.data.success) {
        setIsEditOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/teachers/${selectedTeacher._id}`);
      if (res.data.success) {
        setIsDeleteOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      email: teacher.userId?.email || '',
      employeeId: teacher.employeeId,
      phone: teacher.phone,
      designation: teacher.designation,
      qualification: teacher.qualification,
      specialization: teacher.specialization || '',
      departmentId: teacher.departmentId?._id || '',
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Teaching Staff"
        description="Manage professors, assistant faculty, departments, and course allocations."
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setFormData(initialForm);
            setIsAddOpen(true);
          }}
          icon={Plus}
        >
          Add Faculty Member
        </Button>
      </PageHeader>

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading faculty profiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft card-elevated flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={teacher.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-500/20 shadow-sm"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {teacher.fullName}
                      </h4>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                        {teacher.designation}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {teacher.employeeId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(teacher)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-navy-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-navy-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span className="truncate">{teacher.departmentId?.name || 'Department'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.userId?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                  {teacher.specialization && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 p-2 rounded-xl">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Research: {teacher.specialization}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Faculty Member"
        subtitle="Register new academic faculty and instructor profile."
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4">
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
                placeholder="Dr. Amit Verma"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="EMP-105"
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
                placeholder="dr.amit@sgtu.edu"
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
                placeholder="+91 98765 00000"
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
                Designation
              </label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="Professor & HOD">Professor & HOD</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Adjunct Lecturer">Adjunct Lecturer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Research Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Distributed Consensus, Natural Language Processing"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Faculty Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTeacher}
        title="Deactivate Faculty Account"
        message={`Are you sure you want to revoke access for ${selectedTeacher?.fullName}?`}
        isLoading={actionLoading}
      />
    </div>
  );
};
