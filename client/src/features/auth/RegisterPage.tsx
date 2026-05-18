import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from './auth.schema';
import { useAuth } from './AuthContext';
import { Button, Input, Select } from '../../components/common';
import { isApiError } from '../../lib';
import toast from 'react-hot-toast';
import { LayoutDashboard } from 'lucide-react';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created successfully!');
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Registration failed';
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

        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create your account</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
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
          <Select
            label="Role"
            options={[
              { value: 'sales', label: 'Sales User' },
              { value: 'admin', label: 'Admin' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />
          {errors.root?.message && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
          )}
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}