import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Input, Button } from '../components/common';
import { useAuth } from '../hooks';
import { loginSchema } from '../utils';
import { useValidation } from '../utils/validation';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const { errors, isValid } = useValidation(values, loginSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await login(values.email, values.password);
    } catch (err) {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Smart Leads</h1>
          </div>
          <h2 className="text-xl font-semibold text-center mb-6">Welcome back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} error={errors.email} placeholder="admin@demo.com" />
            <Input label="Password" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} error={errors.password} placeholder="••••••••" />
            <Button type="submit" className="w-full" disabled={!isValid}>Sign In</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link></p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Admin: admin@demo.com / admin123</p>
            <p>Sales: sales@demo.com / sales123</p>
          </div>
        </div>
      </div>
    </div>
  );
}