import { api } from '../../lib';
import type { LoginPayload, RegisterPayload, AuthResponse, ApiResponse, User, UserStatusUpdatePayload, UsersResponse, PaginationMeta, ProfileUpdatePayload } from '../../types';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};

export const usersApi = {
  getAllUsers: async (page = 1, limit = 10): Promise<{ users: User[]; meta: PaginationMeta }> => {
    const res = await api.get<ApiResponse<User[]> & { meta?: PaginationMeta }>(`/users?page=${page}&limit=${limit}`);
    return {
      users: res.data.data || [],
      meta: res.data.meta || { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    };
  },

  updateUserStatus: async (userId: string, payload: UserStatusUpdatePayload): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>(`/users/${userId}/status`, payload);
    return res.data.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/users/profile');
    return res.data.data;
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>('/users/profile', payload);
    return res.data.data;
  },

  deleteProfile: async (): Promise<void> => {
    await api.delete('/users/profile');
  },
};