import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth';
import { usersApi } from '../../features/auth/auth.api';
import { User, PaginationMeta } from '../../types';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination } from '../../components/common';
import { ConfirmDialog } from '../../components/common';
import { UsersTable } from './UsersTable';
import toast from 'react-hot-toast';
import { isApiError } from '../../lib';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
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

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handlePageChange = useCallback((page: number) => {
    fetchUsers(page);
  }, [fetchUsers]);

  const handleToggle = useCallback((user: User) => {
    setConfirmTarget(user);
  }, []);

  const handleToggleConfirm = useCallback(async () => {
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
            <UsersTable users={users} currentUserId={currentUser?._id || ''} toggling={toggling} onToggle={handleToggle} />
          </div>
          <div className="mt-4">
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleToggleConfirm}
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