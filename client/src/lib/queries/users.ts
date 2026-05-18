import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../features/auth/auth.api';
import type { User, UserStatusUpdatePayload, ProfileUpdatePayload } from '../../types';

export const userKeys = {
  all: ['users'] as const,
  list: (page: number) => [...userKeys.all, 'list', page] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export function useUsers(page: number) {
  return useQuery({
    queryKey: userKeys.list(page),
    queryFn: () => usersApi.getAllUsers(page),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => usersApi.getProfile(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => usersApi.updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => usersApi.deleteProfile(),
    onSuccess: () => {
      qc.removeQueries({ queryKey: userKeys.all });
    },
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UserStatusUpdatePayload }) =>
      usersApi.updateUserStatus(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useSalesUsers() {
  return useQuery({
    queryKey: ['users', 'sales'],
    queryFn: () => usersApi.getAllUsers(1, 50).then(res => res.users.filter(u => u.role === 'sales' && u.isActive)),
    staleTime: 60_000,
  });
}