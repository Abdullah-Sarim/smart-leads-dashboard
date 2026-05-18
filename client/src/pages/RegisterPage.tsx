import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Input, Button, Select } from '../components/common';
import { useAuth } from '../hooks';
import { registerSchema } from '../utils';
import { useValidation } from '../utils/validation';
import { UserRole } from '../types';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', password: '', role: UserRole.SalesUser });
  const { register } = useAuth();
  const { errors, isValid } = useValidation(values, registerSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await register(values.name, values.email, values.password, values.role);
    } catch {
      toast.error('Registration failed');
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
          <h2 className="text-xl font-semibold text-center mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} error={errors.name} placeholder="John Doe" />
            <Input label="Email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} error={errors.email} placeholder="john@example.com" />
            <Input label="Password" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} error={errors.password} placeholder="••••••••" />
            <Select label="Role" value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value as UserRole })} options={Object.values(UserRole).map((r) => ({ value: r, label: r }))} />
            <Button type="submit" className="w-full" disabled={!isValid}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}