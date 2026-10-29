import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Core Pages
import { LoginPage } from './pages/auth/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { TeacherManagement } from './pages/admin/TeacherManagement';
import { DepartmentCourseManagement } from './pages/admin/DepartmentCourseManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { AssignmentPage } from './pages/assignments/AssignmentPage';
import { ExamResultsPage } from './pages/examinations/ExamResultsPage';
import { FeeManagementPage } from './pages/fees/FeeManagementPage';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';
import { LibraryPage } from './pages/library/LibraryPage';

// Enterprise University Operations Pages
import { TimetablePage } from './pages/timetable/TimetablePage';
import { CertificatesPage } from './pages/certificates/CertificatesPage';
import { PayrollPage } from './pages/payroll/PayrollPage';
import { HostelPage } from './pages/hostel/HostelPage';
import { TransportPage } from './pages/transport/TransportPage';
import { PlacementPage } from './pages/placement/PlacementPage';
import { LeaveGrievancePage } from './pages/grievance/LeaveGrievancePage';
import { QuestionPapersPage } from './pages/academics/QuestionPapersPage';
import { HodDashboard } from './pages/hod/HodDashboard';
import { LibrarianDashboard } from './pages/librarian/LibrarianDashboard';

export const App = () => {
  const { user } = useAuth();

  // Root redirect based on role
  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'TEACHER') return '/teacher/dashboard';
    if (user.role === 'HOD') return '/hod/dashboard';
    if (user.role === 'LIBRARIAN') return '/librarian/dashboard';
    return '/admin/dashboard';
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* Authenticated Application */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin Specific Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT']}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <TeacherManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academic-structure"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <DepartmentCourseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'HOD', 'ADMIN', 'SUPER_ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* HOD Leadership Route */}
        <Route
          path="/hod/dashboard"
          element={
            <ProtectedRoute allowedRoles={['HOD', 'ADMIN', 'SUPER_ADMIN']}>
              <HodDashboard />
            </ProtectedRoute>
          }
        />

        {/* Librarian Operations Route */}
        <Route
          path="/librarian/dashboard"
          element={
            <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN', 'SUPER_ADMIN']}>
              <LibrarianDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Core Academic & Financial Modules */}
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/assignments" element={<AssignmentPage />} />
        <Route path="/examinations" element={<ExamResultsPage />} />
        <Route path="/fees" element={<FeeManagementPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />

        {/* Enterprise Operations Modules */}
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/hostel" element={<HostelPage />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/placement" element={<PlacementPage />} />
        <Route path="/leave-grievance" element={<LeaveGrievancePage />} />
        <Route path="/question-papers" element={<QuestionPapersPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
