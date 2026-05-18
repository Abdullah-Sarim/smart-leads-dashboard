import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ChevronLeft, ChevronRight, X, UserCog } from 'lucide-react';
import { useAuth } from '../../features/auth';
import { UserRole } from '../../types';
import { useState } from 'react';
import { LogoutConfirmDialog, ThemeToggle } from '../common';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Leads', to: '/leads', icon: Users },
];

const adminNavItems = [
  { label: 'Users Management', to: '/users', icon: UserCog },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ mobileOpen, onMobileClose, collapsed = false, onCollapsedChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const handleToggle = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed);
    }
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white shadow-xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 md:static md:z-auto md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${collapsed ? 'md:w-16' : 'md:w-64'} w-72`}
      >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <span className={`text-lg font-bold text-gray-900 dark:text-gray-100 ${collapsed ? 'md:hidden' : ''}`}>Smart Leads</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={collapsed ? 'md:hidden' : ''}>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ label, to, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
            </Link>
          );
        })}
        {user?.role === UserRole.Admin && (
          <>
            <div className={`h-px bg-gray-200 dark:bg-gray-800 my-2 ${collapsed ? 'md:hidden' : ''}`} />
            {adminNavItems.map(({ label, to, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 truncate ${collapsed ? 'md:hidden' : ''}`}>{user.name}</p>
            <p className={`text-xs text-gray-500 dark:text-gray-400 capitalize ${collapsed ? 'md:hidden' : ''}`}>{user.role}</p>
          </div>
        )}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={collapsed ? 'md:hidden' : ''}>Logout</span>
        </button>
        <button
          onClick={handleToggle}
          className="hidden md:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mt-1"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
      </aside>
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
      />
    </>
  );
}
