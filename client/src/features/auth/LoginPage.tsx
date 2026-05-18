import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from './auth.schema';
import { useAuth } from './AuthContext';
import { Button, Input } from '../../components/common';
import { isApiError } from '../../lib';
import { LayoutDashboard } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Login failed';
      setError('root', { message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Smart Leads</h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>

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
            {...register('password')}
          />
          {errors.root?.message && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
          )}
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}