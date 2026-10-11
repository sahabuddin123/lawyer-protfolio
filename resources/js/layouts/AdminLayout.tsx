import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar, AdminHeader } from '@/components/admin';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Desktop sidebar collapse state (persisted)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nijam_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile sidebar drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Persist collapse state
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nijam_admin_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Skip Link for Accessibility */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-md"
      >
        Skip to administrative content
      </a>

      {/* Admin Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        {/* Admin Header */}
        <AdminHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapse={toggleSidebarCollapse}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Viewport Content */}
        <main
          id="admin-main-content"
          className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] p-0"
        >
          <Outlet />
        </main>

        {/* Admin Minimal Footer */}
        <footer className="border-t border-slate-200/80 bg-white px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-600">
            Advocate Nijam Uddin (Haq) &bull; Supreme Court of Bangladesh
          </p>
          <p className="text-slate-400 font-mono text-[11px]">
            Chambers CMS Platform &bull; Security Protocols Active
          </p>
        </footer>
      </div>
    </div>
  );
};
