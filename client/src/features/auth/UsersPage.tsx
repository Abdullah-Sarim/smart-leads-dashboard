import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth';
import { usersApi } from '../../features/auth/auth.api';
import { User, UserRole, PaginationMeta } from '../../types';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination } from '../../components/common';
import { ConfirmDialog } from '../../components/common';
import { UserCog, Power } from 'lucide-react';
import { isApiError } from '../../lib';
import toast from 'react-hot-toast';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAllUsers(page);
      setUsers(data.users);
      setMeta(data.meta);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = useCallback((page: number) => {
    fetchUsers(page);
  }, [fetchUsers]);

  const handleToggleStatus = useCallback(async () => {
    if (!confirmTarget) return;

    const newStatus = !confirmTarget.isActive;
    const actionWord = newStatus ? 'activate' : 'deactivate';

    setToggling(confirmTarget._id);
    try {
      await usersApi.updateUserStatus(confirmTarget._id, { isActive: newStatus });
      toast.success(`User ${actionWord}d successfully`);
      setConfirmTarget(null);
      fetchUsers(meta.page);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : `Failed to ${actionWord} user`);
    } finally {
      setToggling(null);
    }
  }, [confirmTarget, meta.page, fetchUsers]);

  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  if (loading && users.length === 0) return <FullPageLoader />;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-4 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage user accounts and permissions</p>
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={() => fetchUsers(meta.page)} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="There are no registered users yet" />
      ) : (
        <>
          <div className="overflow-y-auto flex-1">
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
                          {user._id !== currentUser?._id && (
                            <button
                              type="button"
                              onClick={() => setConfirmTarget(user)}
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
          </div>
          <div className="mt-4">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleToggleStatus}
        title={confirmTarget?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirmTarget?.isActive ? 'deactivate' : 'activate'} ${confirmTarget?.name}? ${
          confirmTarget?.isActive ? 'They will not be able to log in until reactivated.' : 'They will be able to log in again.'
        }`}
        confirmLabel={confirmTarget?.isActive ? 'Deactivate' : 'Activate'}
        variant={confirmTarget?.isActive ? 'danger' : 'primary'}
        loading={!!toggling}
      />
    </div>
  );
}