import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Select } from '../common';
import type { Lead, LeadStatus, LeadSource } from '../../types';
import { leadFormSchema, statusColors, sourceColors } from '../../utils';
import { useValidation } from '../../utils/validation';
import toast from 'react-hot-toast';

interface LeadFormProps {
  onSubmit: (data: { name: string; email: string; status?: LeadStatus; source?: LeadSource }) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<Lead>;
  isEdit?: boolean;
}

export function LeadForm({ onSubmit, onClose, initialData, isEdit }: LeadFormProps) {
  const [values, setValues] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    status: initialData?.status || LeadStatus.New,
    source: initialData?.source || LeadSource.Website,
  });
  const [loading, setLoading] = useState(false);
  const { errors, isValid } = useValidation(values, leadFormSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await onSubmit(values);
      toast.success(isEdit ? 'Lead updated!' : 'Lead created!');
      onClose();
    } catch {
      toast.error('Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} error={errors.name} placeholder="John Doe" />
          <Input label="Email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} error={errors.email} placeholder="john@example.com" />
          <Select label="Status" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as LeadStatus })} options={Object.values(LeadStatus).map((s) => ({ value: s, label: s }))} />
          <Select label="Source" value={values.source} onChange={(e) => setValues({ ...values, source: e.target.value as LeadSource })} options={Object.values(LeadSource).map((s) => ({ value: s, label: s }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} disabled={!isValid} className="flex-1">{isEdit ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}