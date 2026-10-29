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
  Calendar,
  Landmark,
  Building,
  Bus,
  Briefcase,
  FileText,
  LifeBuoy,
} from 'lucide-react';

export const AppSidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'STUDENT';

  // Grouped Navigation schema based on role
  const getNavSections = () => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return [
        {
          title: 'Main',
          links: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Students', path: '/admin/students', icon: Users },
            { name: 'Faculty & Staff', path: '/admin/teachers', icon: UserCheck },
            { name: 'Depts & Courses', path: '/admin/academic-structure', icon: Building2 },
          ],
        },
        {
          title: 'Academics',
          links: [
            { name: 'Class Timetable', path: '/timetable', icon: Calendar },
            { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
            { name: 'Assignments', path: '/assignments', icon: FileSpreadsheet },
            { name: 'Exams & Results', path: '/examinations', icon: Award },
          ],
        },
        {
          title: 'Operations & Finance',
          links: [
            { name: 'Fees & Invoices', path: '/fees', icon: CreditCard },
            { name: 'Faculty Payroll', path: '/payroll', icon: Landmark },
            { name: 'ID & Certificates', path: '/certificates', icon: FileText },
            { name: 'Library & Books', path: '/library', icon: BookOpen },
            { name: 'Hostel & Housing', path: '/hostel', icon: Building },
            { name: 'Campus Transport', path: '/transport', icon: Bus },
            { name: 'Placements (T&P)', path: '/placement', icon: Briefcase },
          ],
        },
        {
          title: 'Support',
          links: [
            { name: 'Leaves & Grievance', path: '/leave-grievance', icon: LifeBuoy },
            { name: 'Announcements', path: '/announcements', icon: Bell },
          ],
        },
      ];
    }

    if (role === 'TEACHER') {
      return [
        {
          title: 'Main',
          links: [
            { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          ],
        },
        {
          title: 'Academics',
          links: [
            { name: 'Class Timetable', path: '/timetable', icon: Calendar },
            { name: 'Mark Attendance', path: '/attendance', icon: CalendarCheck },
            { name: 'Assignments & Grading', path: '/assignments', icon: FileSpreadsheet },
            { name: 'Marks & Results', path: '/examinations', icon: Award },
          ],
        },
        {
          title: 'Campus & Career',
          links: [
            { name: 'My Salary Slips', path: '/payroll', icon: Landmark },
            { name: 'Library & Books', path: '/library', icon: BookOpen },
            { name: 'Campus Transport', path: '/transport', icon: Bus },
          ],
        },
        {
          title: 'Support',
          links: [
            { name: 'Leaves & Grievance', path: '/leave-grievance', icon: LifeBuoy },
            { name: 'Announcements', path: '/announcements', icon: Bell },
          ],
        },
      ];
    }

    if (role === 'ACCOUNTANT') {
      return [
        {
          title: 'Main',
          links: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          ],
        },
        {
          title: 'Finance & Operations',
          links: [
            { name: 'Fees & Invoices', path: '/fees', icon: CreditCard },
            { name: 'Faculty Payroll', path: '/payroll', icon: Landmark },
            { name: 'Fee No-Dues Certs', path: '/certificates', icon: FileText },
            { name: 'Student Records', path: '/admin/students', icon: Users },
            { name: 'Library Management', path: '/library', icon: BookOpen },
          ],
        },
        {
          title: 'Support',
          links: [
            { name: 'Announcements', path: '/announcements', icon: Bell },
          ],
        },
      ];
    }

    // Default: STUDENT
    return [
      {
        title: 'Main',
        links: [
          { name: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'My Profile', path: '/student/profile', icon: User },
        ],
      },
      {
        title: 'Academics',
        links: [
          { name: 'Class Timetable', path: '/timetable', icon: Calendar },
          { name: 'ID Card & Certs', path: '/certificates', icon: FileText },
          { name: 'Attendance Record', path: '/attendance', icon: CalendarCheck },
          { name: 'Coursework', path: '/assignments', icon: FileSpreadsheet },
          { name: 'Exams & Grades', path: '/examinations', icon: Award },
        ],
      },
      {
        title: 'Campus Life',
        links: [
          { name: 'Fee Receipts', path: '/fees', icon: CreditCard },
          { name: 'Library & Books', path: '/library', icon: BookOpen },
          { name: 'Hostel & Gate Pass', path: '/hostel', icon: Building },
          { name: 'Campus Bus Pass', path: '/transport', icon: Bus },
          { name: 'Campus Placements', path: '/placement', icon: Briefcase },
        ],
      },
      {
        title: 'Support',
        links: [
          { name: 'Leaves & Grievance', path: '/leave-grievance', icon: LifeBuoy },
          { name: 'Announcements', path: '/announcements', icon: Bell },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 text-slate-800 dark:text-white select-none transition-colors">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-navy-800 shrink-0">
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

      {/* Nav List with organized sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                {section.title}
              </div>
            )}
            {section.links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                      isCollapsed ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-navy-800'
                    }`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Mini Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-navy-800 shrink-0">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } gap-2`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.profile?.fullName || user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400 capitalize font-medium">{role.toLowerCase()}</span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar in Normal Document Flow */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Mobile Sidebar Slide-over Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 h-screen w-72 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;
