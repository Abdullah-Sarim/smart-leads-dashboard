import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useState } from 'react';

export function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className={`fixed top-0 right-0 transition-all duration-300 ${sidebarCollapsed ? 'md:left-16' : 'md:left-64'} left-0 z-40`}>
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto pt-16 px-4 sm:px-5 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
