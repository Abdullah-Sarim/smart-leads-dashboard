import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from './auth.schema';
import { useAuth } from './AuthContext';
import { Button, Input } from '../../components/common';
import { isApiError } from '../../lib';
import { LayoutDashboard, UserCog, User } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fillDemo = (email: string) => {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = email === 'admin@demo.com' ? 'admin123' : 'sales123';
    document.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      await login(data);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError('root', { message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Smart Leads</h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Sign in to your account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="admin@demo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            showPasswordToggle
            {...register('password')}
          />
          {errors.root?.message && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{errors.root.message}</p>
          )}
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
            Sign up
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Demo Accounts</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@demo.com')}
              className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5 text-left hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                <UserCog className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Admin Account</p>
                <p className="truncate text-xs text-purple-600/80 dark:text-purple-400/80">admin@demo.com / admin123</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('sales@demo.com')}
              className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-left hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Sales Account</p>
                <p className="truncate text-xs text-blue-600/80 dark:text-blue-400/80">sales@demo.com / sales123</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}