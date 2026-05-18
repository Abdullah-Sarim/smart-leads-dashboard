import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth';
import { authApi } from '../../features/auth/auth.api';
import { User, UserRole } from '../../types';
import { FullPageLoader, EmptyState, ErrorMessage, Button } from '../../components/common';
import { Modal } from '../../components/common';
import { Input } from '../../components/common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, UserCog } from 'lucide-react';
import { isApiError } from '../../lib';
import toast from 'react-hot-toast';

const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type UserFormValues = z.infer<typeof userSchema>;

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenForm = () => {
    reset({ name: '', email: '', password: '' });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    reset();
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    if (deleteTarget._id === currentUser?._id) {
      toast.error('You cannot delete yourself');
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/users/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, currentUser, fetchUsers]);

  const onSubmit = async (data: UserFormValues) => {
    setSubmitting(true);
    try {
      await authApi.register(data);
      toast.success('User created successfully');
      setShowForm(false);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sales Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage all sales team members</p>
        </div>
        <Button onClick={handleOpenForm} loading={submitting} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="Add your first sales team member" />
      ) : (
        <div className="overflow-y-auto flex-1">
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {['Name', 'Email', 'Role', 'Created At'].map((col) => (
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
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {user._id !== currentUser?._id && (
                          <button 
                            type="button" 
                            onClick={() => setDeleteTarget(user)} 
                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title="Add Sales User"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseForm} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={submitting}>Create User</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input 
            label="Name" 
            placeholder="e.g. John Doe" 
            {...register('name')} 
            error={errors.name?.message} 
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="john@example.com" 
            {...register('email')} 
            error={errors.email?.message} 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Min 6 characters" 
            {...register('password')} 
            error={errors.password?.message} 
          />
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{deleteTarget?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}