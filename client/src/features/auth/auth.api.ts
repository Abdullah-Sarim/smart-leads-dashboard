import { api } from '../lib';
import type { LoginPayload, RegisterPayload, AuthResponse, ApiResponse, User } from '../../types';

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