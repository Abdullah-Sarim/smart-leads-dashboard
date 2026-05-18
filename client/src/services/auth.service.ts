import api from './api';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },
  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/profile');
    return res.data.data;
  },
};