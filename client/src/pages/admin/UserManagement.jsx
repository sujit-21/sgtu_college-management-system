import React, { useState, useEffect } from 'react';
import {
  Users,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  GraduationCap,
  BookOpen,
  DollarSign,
  UserX,
  Download,
  UploadCloud,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    studentsCount: 0,
    facultyCount: 0,
    hodCount: 0,
    staffCount: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvReport, setCsvReport] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Create Form State
  const initialCreateForm = {
    collegeId: '',
    email: '',
    password: '',
    role: 'STUDENT',
    fullName: '',
    phone: '',
    departmentId: '',
  };
  const [createForm, setCreateForm] = useState(initialCreateForm);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    collegeId: '',
    email: '',
    role: 'STUDENT',
    isActive: true,
    fullName: '',
    phone: '',
    password: '',
  });

  // Password Reset State
  const [newPassword, setNewPassword] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Sgtu@${pass}`;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDepts();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // 1. Create User & Assign ID and Password
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/users', createForm);
      if (res.data.success) {
        setNotification(res.data.message);
        setIsCreateOpen(false);
        setCreateForm(initialCreateForm);
        fetchUsers();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Open Edit User Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      collegeId: user.collegeId,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      fullName: user.fullName || '',
      phone: user.phone || '',
      password: '',
    });
    setIsEditOpen(true);
  };

  // 3. Submit Edit User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.put(`/users/${selectedUser._id}`, editForm);
      if (res.data.success) {
        setNotification(res.data.message);
        setIsEditOpen(false);
        fetchUsers();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Open Password Assignment Modal
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword(generatePassword());
    setIsPasswordModalOpen(true);
  };

  // 5. Submit Password Assignment
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.patch(`/users/${selectedUser._id}/password`, {
        newPassword,
      });
      if (res.data.success) {
        setNotification(res.data.message);
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setTimeout(() => setNotification(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning new password.');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Delete User
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete account for '${user.email}' (${user.collegeId})?`)) {
      return;
    }
    try {
      const res = await api.delete(`/users/${user._id}`);
      if (res.data.success) {
        setNotification(res.data.message);
        fetchUsers();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const exportUsersCSV = () => {
    const headers = ['College ID', 'Full Name', 'Email', 'Role', 'Phone', 'Status', 'Created Date'];
    const rows = users.map((u) => [
      u.collegeId,
      `"${u.fullName || ''}"`,
      u.email,
      u.role,
      u.phone || '',
      u.isActive ? 'Active' : 'Deactivated',
      u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SGTU_Users_Credentials_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSampleCSV = () => {
    const sample = `collegeId,fullName,email,role,phone,password
SGTU2026CS101,Rohan Mehta,rohan.mehta@sgtu.edu,STUDENT,+91 98765 12001,Sgtu@Pass123
SGTU2026CS102,Ananya Sen,ananya.sen@sgtu.edu,STUDENT,+91 98765 12002,Sgtu@Pass123
EMP-FAC-ME-05,Dr. Alok Verma,alok.verma@sgtu.edu,TEACHER,+91 98765 12003,Sgtu@Pass123`;
    setCsvText(sample);
  };

  const handleImportCSV = async () => {
    if (!csvText.trim()) return;
    setCsvLoading(true);
    setCsvReport(null);

    const lines = csvText.trim().split('\n');
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    const startIdx = lines[0].toLowerCase().includes('collegeid') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      const [collegeId, fullName, email, role, phone, password] = parts;

      if (!collegeId || !email) {
        failCount++;
        errors.push(`Line ${i + 1}: Missing College ID or Email`);
        continue;
      }

      try {
        await api.post('/users', {
          collegeId,
          fullName: fullName || 'University Member',
          email,
          role: role ? role.toUpperCase() : 'STUDENT',
          phone: phone || '+91 98765 00000',
          password: password || 'Sgtu@Secure2026',
          departmentId: departments[0]?._id || '',
        });
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`${collegeId} (${email}): ${err.response?.data?.message || 'Failed'}`);
      }
    }

    setCsvReport({ successCount, failCount, errors });
    setCsvLoading(false);
    if (successCount > 0) {
      setNotification(`Bulk import completed: ${successCount} users created in directory!`);
      fetchUsers();
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'HOD':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'TEACHER':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'LIBRARIAN':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'ACCOUNTANT':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'STUDENT':
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User Credentials & Access Control"
        subtitle="Assign unique College IDs, set login passwords, manage university roles, and govern active credentials across all departments."
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={fetchUsers}
            className="flex items-center gap-1.5 border-slate-300 dark:border-navy-700 text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={exportUsersCSV}
            className="flex items-center gap-1.5 border-slate-300 dark:border-navy-700 text-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setCsvReport(null);
              setIsCsvModalOpen(true);
            }}
            className="flex items-center gap-1.5 border-slate-300 dark:border-navy-700 text-xs"
          >
            <UploadCloud className="w-4 h-4" />
            Bulk Import CSV
          </Button>

          <Button
            onClick={() => {
              setCreateForm({
                ...initialCreateForm,
                password: generatePassword(),
                departmentId: departments[0]?._id || '',
              });
              setIsCreateOpen(true);
            }}
            className="bg-primary hover:bg-primary-600 text-white flex items-center gap-2 shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" />
            Assign New ID &amp; Password
          </Button>
        </div>
      </PageHeader>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="font-bold text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-navy-900 rounded-xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Total Accounts
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.totalUsers || users.length}
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            Active Logins
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.activeUsers || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Students
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.studentsCount || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Professors
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.facultyCount || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            HODs
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.hodCount || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            Library &amp; Staff
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats.staffCount || 0}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-navy-900 rounded-xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by College ID (e.g. SGTU-2023-CS01, HOD-CSE-01, LIB-001) or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Faculty</option>
            <option value="HOD">HODs</option>
            <option value="LIBRARIAN">Librarians</option>
            <option value="ACCOUNTANT">Accountants</option>
            <option value="ADMIN">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Logins</option>
            <option value="INACTIVE">Deactivated</option>
          </select>

          {(search || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Users Accounts Data Table */}
      <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Assigned College ID</th>
                <th className="py-3.5 px-4">User Name &amp; Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mb-2" />
                    <div>Loading user accounts...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                    {/* College ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700">
                        {user.collegeId}
                      </span>
                    </td>

                    {/* Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {user.fullName || 'User'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {user.email}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {user.departmentName}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          user.isActive
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30'
                            : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign / Reset Password */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPasswordModal(user)}
                          title="Assign New Password"
                          className="text-[11px] py-1 px-2 h-auto flex items-center gap-1 text-primary border-primary/30 hover:bg-primary/5"
                        >
                          <KeyRound className="w-3 h-3" />
                          Set Password
                        </Button>

                        {/* Edit User Details */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(user)}
                          title="Edit User Details"
                          className="text-[11px] py-1 px-2 h-auto text-slate-700 dark:text-slate-200"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal: Create New User & Assign Credentials */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Assign ID &amp; Password for New User"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign College ID / Reg. No. *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SGTU-2026-CS88 or EMP-205"
                  value={createForm.collegeId}
                  onChange={(e) => setCreateForm({ ...createForm, collegeId: e.target.value.toUpperCase() })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  User Role *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Faculty (Teacher)</option>
                  <option value="HOD">Head of Department (HOD)</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  placeholder="name@sgtu.edu"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value.toLowerCase() })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sen"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Password Assignment */}
            <div className="p-3.5 bg-slate-50 dark:bg-navy-800/80 rounded-xl border border-slate-200 dark:border-navy-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  Assign Login Password *
                </label>
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, password: generatePassword() })}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Generate
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter initial password (min 6 chars)"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full py-2 pl-3 pr-10 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white font-mono"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={createForm.departmentId}
                  onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-700">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="bg-primary hover:bg-primary-600 text-white">
                {actionLoading ? 'Creating User...' : 'Assign Credentials & Create'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Modal: Direct Password Assignment / Reset by Admin */}
      {isPasswordModalOpen && selectedUser && (
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title={`Assign New Password for ${selectedUser.fullName || selectedUser.collegeId}`}
        >
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 space-y-1">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Target User Account:</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedUser.fullName} &bull; <span className="font-mono text-primary">{selectedUser.collegeId}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{selectedUser.email}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  New Password to Assign *
                </label>
                <button
                  type="button"
                  onClick={() => setNewPassword(generatePassword())}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Generate
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full py-2.5 pl-3 pr-10 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white font-mono text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                User will immediately be able to log in with this new password. Old sessions will be superseded.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-700">
              <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="bg-primary hover:bg-primary-600 text-white">
                {actionLoading ? 'Saving...' : 'Set & Assign New Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Modal: Edit User Account & ID */}
      {isEditOpen && selectedUser && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Account - ${selectedUser.collegeId}`}
        >
          <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned College ID *
                </label>
                <input
                  type="text"
                  value={editForm.collegeId}
                  onChange={(e) => setEditForm({ ...editForm, collegeId: e.target.value.toUpperCase() })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  User Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Faculty (Teacher)</option>
                  <option value="HOD">Head of Department (HOD)</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value.toLowerCase() })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Change Password (optional - leave blank to keep unchanged)
              </label>
              <input
                type="password"
                placeholder="Leave blank to preserve existing password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="editIsActive" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Account Active &amp; Allowed to Log In
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-700">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="bg-primary hover:bg-primary-600 text-white">
                {actionLoading ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {isCsvModalOpen && (
        <Modal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          title="Bulk Import User Accounts (CSV)"
          subtitle="Quickly provision batches of students, faculty, or staff accounts into the university directory."
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Expected CSV Format (Comma Separated):
              </div>
              <code className="text-[11px] font-mono text-brand-600 dark:text-brand-400 block bg-white dark:bg-navy-900 p-2 rounded-lg border border-slate-200 dark:border-navy-800">
                collegeId,fullName,email,role,phone,password
              </code>
              <p className="text-[10px] text-slate-400">
                Supported Roles: STUDENT, TEACHER, HOD, LIBRARIAN, ACCOUNTANT
              </p>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Paste CSV Data or Load Demo Template:
              </label>
              <button
                type="button"
                onClick={loadSampleCSV}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample CSV Rows</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="collegeId,fullName,email,role,phone,password&#10;SGTU2026CS101,Rohan Mehta,rohan.mehta@sgtu.edu,STUDENT,+91 98765 12001,Sgtu@Pass123"
              className="w-full p-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-brand-500 outline-hidden"
            />

            {csvReport && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  csvReport.successCount > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>
                    Import Summary: {csvReport.successCount} Created, {csvReport.failCount} Skipped
                  </span>
                </div>
                {csvReport.errors.length > 0 && (
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 max-h-20 overflow-y-auto pl-2 border-l-2 border-rose-300">
                    {csvReport.errors.map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
              <Button type="button" variant="outline" onClick={() => setIsCsvModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleImportCSV}
                isLoading={csvLoading}
                disabled={!csvText.trim()}
                icon={UploadCloud}
                className="bg-primary hover:bg-primary-600 text-white"
              >
                Import Users into Directory
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
