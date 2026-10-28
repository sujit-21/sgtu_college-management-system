import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  CreditCard,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';

export const AppSidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'STUDENT';

  // Navigation schema based on user role
  const getNavLinks = () => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Faculty & Staff', path: '/admin/teachers', icon: UserCheck },
        { name: 'Depts & Courses', path: '/admin/academic-structure', icon: Building2 },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Assignments', path: '/assignments', icon: FileSpreadsheet },
        { name: 'Exams & Results', path: '/examinations', icon: Award },
        { name: 'Fees & Invoices', path: '/fees', icon: CreditCard },
        { name: 'Library & Books', path: '/library', icon: BookOpen },
        { name: 'Announcements', path: '/announcements', icon: Bell },
      ];
    }

    if (role === 'TEACHER') {
      return [
        { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Mark Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Assignments & Grading', path: '/assignments', icon: FileSpreadsheet },
        { name: 'Marks & Results', path: '/examinations', icon: Award },
        { name: 'Library & Books', path: '/library', icon: BookOpen },
        { name: 'Announcements', path: '/announcements', icon: Bell },
      ];
    }

    if (role === 'ACCOUNTANT') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Fees & Invoices', path: '/fees', icon: CreditCard },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Library & Books', path: '/library', icon: BookOpen },
        { name: 'Announcements', path: '/announcements', icon: Bell },
      ];
    }

    // Default: STUDENT
    return [
      { name: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', path: '/student/profile', icon: User },
      { name: 'Attendance Record', path: '/attendance', icon: CalendarCheck },
      { name: 'Coursework & Submissions', path: '/assignments', icon: FileSpreadsheet },
      { name: 'Exams & Grades', path: '/examinations', icon: Award },
      { name: 'Fee Invoices & Receipts', path: '/fees', icon: CreditCard },
      { name: 'Library & Books', path: '/library', icon: BookOpen },
      { name: 'Announcements', path: '/announcements', icon: Bell },
    ];
  };

  const navLinks = getNavLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 text-slate-800 dark:text-white select-none transition-colors">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-navy-800">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo Monogram: SG */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-purple flex items-center justify-center shrink-0 shadow-md shadow-brand-500/25 ring-2 ring-brand-100 dark:ring-brand-900/40">
            <span className="font-black text-white text-base tracking-wider">SG</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                SG Tech University
              </span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-accent-purple" />
                <span>Smart Generation • SGTU</span>
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-navy-800'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Mini Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-navy-800">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 font-extrabold text-xs uppercase shadow-sm">
              {user?.email?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.profile?.fullName || user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {user?.role}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200/60 dark:hover:bg-navy-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
