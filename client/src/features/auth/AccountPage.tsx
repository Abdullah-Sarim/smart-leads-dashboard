import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { usersApi } from '../../features/auth/auth.api';
import { User, UserRole } from '../../types';
import { FullPageLoader, EmptyState, ErrorMessage, Button } from '../../components/common';
import { ConfirmDialog } from '../../components/common';
import { Input } from '../../components/common';
import { UserAvatar } from '../../components/common/UserAvatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCog, Shield, Calendar, Mail, User as UserIcon } from 'lucide-react';
import { isApiError } from '../../lib';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await usersApi.getProfile();
      setProfile(data);
      reset({ name: data.name, email: data.email });
    } catch (err) {
      setFetchError(isApiError(err) ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: ProfileFormValues) => {
    setShowUpdateConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    if (!profile) return;

    const formValues = getValues();
    
    setSubmitting(true);
    try {
      const updatedProfile = await usersApi.updateProfile({ name: formValues.name, email: formValues.email });
      updateUser(updatedProfile);
      setProfile(updatedProfile);
      reset({ name: updatedProfile.name, email: updatedProfile.email });
      toast.success('Profile updated successfully');
      setShowUpdateConfirm(false);
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await usersApi.deleteProfile();
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  if (loading) return <FullPageLoader />;

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message={fetchError} onRetry={fetchProfile} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState title="Profile not found" message="Unable to load your profile information" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account details and preferences</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <UserAvatar email={profile.email} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{profile.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                profile.role === UserRole.Admin
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                <Shield className="w-3 h-3" />
                {profile.role}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                profile.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{profile.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(profile.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Account</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="Your full name"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>

      {profile.role !== UserRole.Admin && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
            Once you delete your account, there is no going back. Your account will be deactivated and you will be logged out.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Profile"
        message="Are you sure you want to update your account details?"
        confirmLabel="Confirm Update"
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action will deactivate your account and log you out."
        confirmLabel="Delete Account"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}