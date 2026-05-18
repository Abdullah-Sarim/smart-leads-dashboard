import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../features/auth';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', to: '/leads', icon: Users },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          {!collapsed && <span className="text-lg font-bold text-gray-900">Smart Leads</span>}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        {user && !collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors mt-1"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}