import { User, UserRole } from '../../types';
import { UserCog, Power } from 'lucide-react';

interface UsersTableProps {
  users: User[];
  currentUserId: string;
  toggling: string | null;
  onToggle: (user: User) => void;
}

export function UsersTable({ users, currentUserId, toggling, onToggle }: UsersTableProps) {
  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateStr));
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {['Name', 'Email', 'Role', 'Status', 'Joined Date'].map((col) => (
              <th key={col} className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">{col}</th>
            ))}
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.role === UserRole.Admin
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  <UserCog className="w-3 h-3" />
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-500">{formatDate(user.createdAt)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  {user._id !== currentUserId && (
                    <button
                      type="button"
                      onClick={() => onToggle(user)}
                      disabled={toggling === user._id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        user.isActive
                          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                          : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                      }`}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}