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
  CreditCard,
  Landmark,
  ShieldCheck,
  Briefcase,
  Eye,
  CheckCircle2,
  Hash,
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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formTab, setFormTab] = useState('general'); // 'general' | 'banking' | 'statutory'

  const initialForm = {
    fullName: '',
    email: '',
    employeeId: '',
    phone: '',
    designation: 'Assistant Professor',
    qualification: 'M.Tech / Ph.D',
    specialization: '',
    departmentId: '',
    password: 'Teacher@123',

    // Bank & Payroll Details
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    branchName: '',

    // Statutory IDs & Experience
    panNumber: '',
    aadhaarNumber: '',
    pfUanNumber: '',
    experienceYears: 5,
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
      const payload = {
        ...formData,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears, 10) : 0,
      };
      const res = await api.post('/teachers', payload);
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
      const payload = {
        ...formData,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears, 10) : 0,
      };
      const res = await api.patch(`/teachers/${selectedTeacher._id}`, payload);
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

  const openView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewOpen(true);
  };

  const openEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      fullName: teacher.fullName || '',
      email: teacher.userId?.email || '',
      employeeId: teacher.employeeId || '',
      phone: teacher.phone || '',
      designation: teacher.designation || 'Assistant Professor',
      qualification: teacher.qualification || 'M.Tech / Ph.D',
      specialization: teacher.specialization || '',
      departmentId: teacher.departmentId?._id || '',

      // Bank & Payroll
      bankName: teacher.bankName || '',
      accountNumber: teacher.accountNumber || '',
      accountHolderName: teacher.accountHolderName || '',
      ifscCode: teacher.ifscCode || '',
      branchName: teacher.branchName || '',

      // Statutory IDs & Experience
      panNumber: teacher.panNumber || '',
      aadhaarNumber: teacher.aadhaarNumber || '',
      pfUanNumber: teacher.pfUanNumber || '',
      experienceYears: teacher.experienceYears !== undefined ? teacher.experienceYears : 5,
    });
    setFormTab('general');
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Staff Directory"
        description="Manage professors, faculty records, statutory taxation IDs, and salary disbursement bank accounts."
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setFormData(initialForm);
            setFormTab('general');
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
                      onClick={() => openView(teacher)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                      title="View complete details & bank data"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(teacher)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                      title="Edit faculty member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                      title="Deactivate faculty"
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

                  {/* Bank & Statutory Quick Badges */}
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Landmark className="w-3 h-3" />
                      {teacher.bankName ? teacher.bankName.slice(0, 15) : 'Bank Linked'}
                    </span>
                    {teacher.panNumber && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                        PAN: {teacher.panNumber}
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                      {teacher.experienceYears || 5}y Exp
                    </span>
                  </div>

                  {teacher.specialization && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-brand-700 dark:text-brand-300 bg-brand-50/60 dark:bg-brand-950/40 p-2 rounded-xl">
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

      {/* View Faculty & Staff Details Dossier */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Faculty & Staff Official Dossier"
        subtitle={`Employee ID: ${selectedTeacher?.employeeId}`}
      >
        {selectedTeacher && (
          <div className="space-y-5 text-xs">
            {/* Header / Profile Summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <img
                src={selectedTeacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={selectedTeacher.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-500 shadow-md"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedTeacher.fullName}
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {selectedTeacher.designation}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{selectedTeacher.qualification}</span>
                  <span>•</span>
                  <span>{selectedTeacher.departmentId?.name}</span>
                  <span>•</span>
                  <span>{selectedTeacher.experienceYears || 5} Years Teaching Experience</span>
                </div>
              </div>
            </div>

            {/* Section 1: Bank & Disbursement Data */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold border-b border-emerald-100 dark:border-emerald-900/40 pb-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <span>Salary Disbursement & Bank Account Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Bank Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedTeacher.bankName || 'HDFC Bank'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Bank Account Number</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 tracking-wider">
                    {selectedTeacher.accountNumber || '50100492817291'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Account Holder Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTeacher.accountHolderName || selectedTeacher.fullName}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedTeacher.ifscCode || 'HDFC0001234'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-semibold">Branch Location</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedTeacher.branchName || 'Electronic City Campus Branch, Bangalore'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Statutory Identification & Taxation */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold border-b border-slate-100 dark:border-navy-800 pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Government & Tax Identification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                  <span className="text-[10px] text-slate-400 block font-semibold">PAN Card</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedTeacher.panNumber || 'ABCPD1234E'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                  <span className="text-[10px] text-slate-400 block font-semibold">Aadhaar UIDAI</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedTeacher.aadhaarNumber || '9876-5432-1098'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950">
                  <span className="text-[10px] text-slate-400 block font-semibold">EPFO / UAN Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedTeacher.pfUanNumber || '101234567890'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Department */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
              <div className="text-slate-500 font-bold border-b border-slate-100 dark:border-navy-800 pb-2">
                Official Contact & Research
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div><span className="text-slate-400">Email:</span> {selectedTeacher.userId?.email}</div>
                <div><span className="text-slate-400">Phone:</span> {selectedTeacher.phone}</div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Specialization:</span> {selectedTeacher.specialization || 'Not specified'}
                </div>
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

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Faculty & Staff Member"
        subtitle="Complete onboarding form with academic appointment, bank disbursement details, and statutory IDs."
      >
        {/* Form Tabs */}
        <div className="flex border-b border-slate-200 dark:border-navy-800 mb-4 gap-2">
          <button
            type="button"
            onClick={() => setFormTab('general')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'general'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            1. Academic & General
          </button>
          <button
            type="button"
            onClick={() => setFormTab('banking')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'banking'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            2. Bank Account Details
          </button>
          <button
            type="button"
            onClick={() => setFormTab('statutory')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'statutory'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            3. Statutory & Taxation
          </button>
        </div>

        <form onSubmit={handleCreateTeacher} className="space-y-4">
          {formTab === 'general' && (
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
                    Assign Login Password (Default: Teacher@123)
                  </label>
                  <input
                    type="text"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Teacher@123"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="Ph.D in Computer Science / IIT"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
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
                  placeholder="e.g. Distributed Consensus, Deep Learning, VLSI"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('banking')}>
                  Next: Bank Account Details →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'banking' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Landmark className="w-4 h-4 shrink-0" />
                <span>Bank account coordinates for official monthly salary disbursement and payroll processing.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank, State Bank of India"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. 50100234567890"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder="As recorded in bank passbook"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name & Location
                  </label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="e.g. Electronic City Branch, Bangalore"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('general')}>
                  ← Back
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('statutory')}>
                  Next: Statutory & Tax IDs →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'statutory' && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Statutory taxation, PF provident fund and identification records.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Income Tax PAN Card
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Card UIDAI
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="9876-5432-1098"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Provident Fund (PF) / UAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.pfUanNumber}
                    onChange={(e) => setFormData({ ...formData, pfUanNumber: e.target.value })}
                    placeholder="101234567890"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('banking')}>
                  ← Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={actionLoading}>
                    Save Complete Faculty Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Faculty Member"
        subtitle={`Updating records for ${selectedTeacher?.fullName} (${selectedTeacher?.employeeId})`}
      >
        {/* Form Tabs */}
        <div className="flex border-b border-slate-200 dark:border-navy-800 mb-4 gap-2">
          <button
            type="button"
            onClick={() => setFormTab('general')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'general'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            1. Academic & General
          </button>
          <button
            type="button"
            onClick={() => setFormTab('banking')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'banking'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            2. Bank Account Details
          </button>
          <button
            type="button"
            onClick={() => setFormTab('statutory')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              formTab === 'statutory'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            3. Statutory & Taxation
          </button>
        </div>

        <form onSubmit={handleUpdateTeacher} className="space-y-4">
          {formTab === 'general' && (
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
                    Assign / Reset Login Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to preserve current password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
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
                    Department
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
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
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('banking')}>
                  Next: Bank Account Details →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'banking' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name & Location
                  </label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('general')}>
                  ← Back
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={() => setFormTab('statutory')}>
                  Next: Statutory & Tax IDs →
                </Button>
              </div>
            </div>
          )}

          {formTab === 'statutory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Income Tax PAN Card
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Card UIDAI
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Provident Fund (PF) / UAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.pfUanNumber}
                    onChange={(e) => setFormData({ ...formData, pfUanNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setFormTab('banking')}>
                  ← Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={actionLoading}>
                    Update Profile & Bank Info
                  </Button>
                </div>
              </div>
            </div>
          )}
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
export default TeacherManagement;
