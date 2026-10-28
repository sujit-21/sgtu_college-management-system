import React, { useState, useEffect } from 'react';
import {
  Building2,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Layers,
  GraduationCap,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const DepartmentCourseManagement = () => {
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'courses' | 'subjects'

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '', headName: '' });
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    departmentId: '',
    durationYears: 4,
    totalSemesters: 8,
    credits: 160,
  });
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    courseId: '',
    teacherId: '',
    semester: 1,
    credits: 4,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, courseRes, subRes, teacherRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses'),
        api.get('/subjects'),
        api.get('/teachers'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (courseRes.data.success) setCourses(courseRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (teacherRes.data.success) setTeachers(teacherRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/departments', deptForm);
      if (res.data.success) {
        setIsDeptModalOpen(false);
        setDeptForm({ code: '', name: '', description: '', headName: '' });
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/courses', courseForm);
      if (res.data.success) {
        setIsCourseModalOpen(false);
        setCourseForm({ code: '', name: '', departmentId: '', durationYears: 4, totalSemesters: 8, credits: 160 });
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/subjects', subjectForm);
      if (res.data.success) {
        setIsSubjectModalOpen(false);
        setSubjectForm({ code: '', name: '', courseId: '', teacherId: '', semester: 1, credits: 4 });
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subject.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Catalog & Structure"
        description="Organize institutional colleges, academic departments, degree curriculums, and course catalogs."
      >
        {activeTab === 'departments' && (
          <Button variant="primary" size="sm" onClick={() => setIsDeptModalOpen(true)} icon={Plus}>
            New Department
          </Button>
        )}
        {activeTab === 'courses' && (
          <Button variant="primary" size="sm" onClick={() => setIsCourseModalOpen(true)} icon={Plus}>
            New Degree Program
          </Button>
        )}
        {activeTab === 'subjects' && (
          <Button variant="primary" size="sm" onClick={() => setIsSubjectModalOpen(true)} icon={Plus}>
            New Catalog Subject
          </Button>
        )}
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'departments'
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'courses'
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'subjects'
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects Catalog ({subjects.length})</span>
        </button>
      </div>

      {/* Tab 1: Departments Grid */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft card-elevated flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                    {dept.code}
                  </span>
                  <span className="text-xs text-slate-400">{dept.studentCount || 0} Students</span>
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  {dept.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {dept.description || 'Department curriculum and research.'}
                </p>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Head of Dept:</span>
                    <span className="font-semibold">{dept.headName || 'Not Assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Academic Programs:</span>
                    <span className="font-semibold">{dept.courseCount || 0} Courses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Faculty Members:</span>
                    <span className="font-semibold">{dept.teacherCount || 0} Staff</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Course Code</th>
                  <th className="px-6 py-3.5">Degree Title</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Credits</th>
                  <th className="px-6 py-3.5">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40">
                    <td className="px-6 py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {course.code}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-white">
                      {course.name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                      {course.departmentId?.name || 'Department'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {course.durationYears} Years ({course.totalSemesters} Sems)
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                      {course.credits} Credits
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                      {course.studentCount || 0} Students
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Subjects */}
      {activeTab === 'subjects' && (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Subject Code</th>
                  <th className="px-6 py-3.5">Subject Name</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Semester</th>
                  <th className="px-6 py-3.5">Credits</th>
                  <th className="px-6 py-3.5">Assigned Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40">
                    <td className="px-6 py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {sub.code}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-white">
                      {sub.name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                      {sub.courseId?.code}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">Semester {sub.semester}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                      {sub.credits}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                      {sub.teacherId?.fullName || (
                        <span className="text-amber-500 italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Create Department"
        subtitle="Define a new academic faculty department."
      >
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Department Code *</label>
              <input
                type="text"
                required
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                placeholder="e.g. MECH"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Head of Department</label>
              <input
                type="text"
                value={deptForm.headName}
                onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })}
                placeholder="e.g. Dr. Ramesh Kumar"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Department Full Name *</label>
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="e.g. Mechanical and Aerospace Engineering"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              placeholder="Curriculum overview..."
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Add Degree Program"
        subtitle="Configure program requirements, duration, and credit hours."
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                placeholder="e.g. BTECH-MECH"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department *</label>
              <select
                required
                value={courseForm.departmentId}
                onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
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
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Program Name *</label>
            <input
              type="text"
              required
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              placeholder="e.g. Bachelor of Technology in Mechanical Engineering"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="6"
                value={courseForm.durationYears}
                onChange={(e) => setCourseForm({ ...courseForm, durationYears: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Semesters</label>
              <input
                type="number"
                min="1"
                max="12"
                value={courseForm.totalSemesters}
                onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Total Credits</label>
              <input
                type="number"
                value={courseForm.credits}
                onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Catalog Subject"
        subtitle="Assign a course subject with academic credits and assigned instructor."
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                placeholder="e.g. CS701"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Associated Program *</label>
              <select
                required
                value={subjectForm.courseId}
                onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
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
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Subject Title *</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              placeholder="e.g. Network Security & Cryptography"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={subjectForm.semester}
                onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Assigned Teacher</label>
              <select
                value={subjectForm.teacherId}
                onChange={(e) => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName} ({t.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
