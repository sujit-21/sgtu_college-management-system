import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopNavbar } from './TopNavbar';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Get human friendly title from path
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/hod/dashboard')) return 'Department Leadership & Faculty Governance (HOD)';
    if (p.includes('/librarian/dashboard')) return 'Central Library & Circulation Portal';
    if (p.includes('/dashboard')) return 'Dashboard Overview';
    if (p.includes('/students')) return 'Student Directory & Admissions';
    if (p.includes('/teachers')) return 'Faculty & Staff Directory';
    if (p.includes('/users')) return 'User Credentials & Access Control';
    if (p.includes('/academic-structure')) return 'Departments & Courses';
    if (p.includes('/timetable')) return 'Class Timetable & Schedule';
    if (p.includes('/attendance')) return 'Attendance Management';
    if (p.includes('/assignments')) return 'Coursework & Assignments';
    if (p.includes('/examinations')) return 'Examinations & Results';
    if (p.includes('/question-papers')) return 'Question Papers (PYQ) Archive';
    if (p.includes('/fees')) return 'Fee Management & Invoices';
    if (p.includes('/payroll')) return 'Faculty Payroll & Salaries';
    if (p.includes('/certificates')) return 'ID Cards & Certificates';
    if (p.includes('/library')) return 'Library & Knowledge Center';
    if (p.includes('/hostel')) return 'Hostel & Residential Accommodation';
    if (p.includes('/transport')) return 'Campus Transport & Bus Fleet';
    if (p.includes('/placement')) return 'Training & Placement Cell (T&P)';
    if (p.includes('/leave-grievance')) return 'Leaves & Grievance Helpdesk';
    if (p.includes('/announcements')) return 'Campus Announcements';
    if (p.includes('/profile')) return 'Personal Student Profile';
    return 'University Portal';
  };

  return (
    <div className="min-h-screen flex bg-page dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Persistent Sidebar in Document Flow */}
      <AppSidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          openMobileSidebar={() => setIsMobileOpen(true)}
          pageTitle={getPageTitle()}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
