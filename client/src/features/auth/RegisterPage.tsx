import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from './auth.schema';
import { useAuth } from './AuthContext';
import { Button, Input } from '../../components/common';
import { isApiError } from '../../lib';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      navigate('/');
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Registration failed';
      setError('root', { message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl rounded-full scale-150" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Smart Leads</h1>
            <p className="text-slate-400 text-sm">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-full text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-400 pl-2">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-full text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 pl-2">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  {...register('password')}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white/5 border rounded-full text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500 ${
                    errors.password ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 pl-2">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white/5 border rounded-full text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500 ${
                    errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 pl-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            {errors.root?.message && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-full text-center">
                {errors.root.message}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}