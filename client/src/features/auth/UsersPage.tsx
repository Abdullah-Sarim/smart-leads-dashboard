import { useState, useCallback } from 'react';
import { useAuth } from '../../features/auth';
import { User } from '../../types';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination } from '../../components/common';
import { ConfirmDialog } from '../../components/common';
import { UsersTable } from './UsersTable';
import { useUsers, useToggleUserStatus } from '../../lib/queries';
import toast from 'react-hot-toast';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);

  const { data, isLoading, error, refetch } = useUsers(page);
  const toggleStatus = useToggleUserStatus();

  const users = data?.users ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
  }, []);

  const handleToggle = useCallback((user: User) => {
    setConfirmTarget(user);
  }, []);

  const handleToggleConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const newStatus = !confirmTarget.isActive;
    const actionWord = newStatus ? 'activate' : 'deactivate';
    try {
      await toggleStatus.mutateAsync({ userId: confirmTarget._id, payload: { isActive: newStatus } });
      toast.success(`User ${actionWord}d successfully`);
      setConfirmTarget(null);
    } catch {
      toast.error(`Failed to ${actionWord} user`);
    }
  }, [confirmTarget, toggleStatus]);

  if (isLoading && users.length === 0) return <FullPageLoader />;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-4 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage user accounts and permissions</p>
        </div>
      </div>

      {error ? (
        <ErrorMessage message={(error as Error).message} onRetry={refetch} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="There are no registered users yet" />
      ) : (
        <>
          <div className="overflow-y-auto flex-1">
            <UsersTable
              users={users}
              currentUserId={currentUser?._id || ''}
              toggling={toggleStatus.isPending ? confirmTarget?._id ?? null : null}
              onToggle={handleToggle}
            />
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
        loading={toggleStatus.isPending}
      />
    </div>
  );
}