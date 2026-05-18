import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { authService } = await import('../services');
    const data = await authService.login({ email, password });
    setAuth(data.user, data.token);
    navigate('/dashboard');
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const { authService } = await import('../services');
    const data = await authService.register({ name, email, password, role });
    setAuth(data.user, data.token);
    navigate('/dashboard');
  };

  return { user, isAuthenticated, logout, login, register };
}