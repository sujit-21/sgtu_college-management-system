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
    if (p.includes('/dashboard')) return 'Dashboard Overview';
    if (p.includes('/students')) return 'Student Directory';
    if (p.includes('/teachers')) return 'Faculty & Staff';
    if (p.includes('/academic-structure')) return 'Departments & Courses';
    if (p.includes('/attendance')) return 'Attendance Management';
    if (p.includes('/assignments')) return 'Coursework & Assignments';
    if (p.includes('/examinations')) return 'Examinations & Results';
    if (p.includes('/fees')) return 'Fee Management & Invoices';
    if (p.includes('/library')) return 'Library & Knowledge Center';
    if (p.includes('/announcements')) return 'Campus Announcements';
    if (p.includes('/profile')) return 'Personal Student Profile';
    return 'University Portal';
  };

  return (
    <div className="min-h-screen flex bg-page dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <AppSidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      {/* Main Container */}
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
