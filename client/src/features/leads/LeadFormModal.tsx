import { useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../components/common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRound, CircleDot } from 'lucide-react';
import { Lead, LeadStatus, LeadSource } from '../leads';
import { useCreateLead, useUpdateLead } from '../../lib/queries';
import toast from 'react-hot-toast';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email'),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLead: Lead | null;
  onSuccess: () => void;
}

export function LeadFormModal({ isOpen, onClose, editingLead, onSuccess }: LeadFormModalProps) {
  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', email: '', status: LeadStatus.New, source: LeadSource.Website },
  });

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const isPending = createLead.isPending || updateLead.isPending;

  useEffect(() => {
    if (isOpen && editingLead) {
      resetForm({ name: editingLead.name, email: editingLead.email, status: editingLead.status, source: editingLead.source });
    } else if (isOpen) {
      resetForm({ name: '', email: '', status: LeadStatus.New, source: LeadSource.Website });
    }
  }, [isOpen, editingLead, resetForm]);

  const onFormSubmit = async (data: LeadFormValues) => {
    try {
      if (editingLead) {
        await updateLead.mutateAsync({ id: editingLead._id, data });
        toast.success('Lead updated successfully');
      } else {
        await createLead.mutateAsync(data);
        toast.success('Lead created successfully');
      }
      onSuccess();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingLead ? 'Edit Lead' : 'Add New Lead'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit(onFormSubmit)} loading={isPending}>{editingLead ? 'Update' : 'Create'}</Button>
        </>
      }
    >
      <form className="space-y-5">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-300">
          {editingLead ? 'Update the lead information and keep the pipeline current.' : 'Add a new lead with the details your team needs to follow up quickly.'}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <UserRound className="h-4 w-4 text-indigo-500" />
            Contact
          </div>
          <div className="grid gap-3">
            <Input label="Name" placeholder="e.g. Rahul Sharma" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" placeholder="rahul@example.com" {...register('email')} error={errors.email?.message} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <CircleDot className="h-4 w-4 text-indigo-500" />
            Lead details
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Status"
              options={[
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Lost', label: 'Lost' },
              ]}
              {...register('status')}
            />
            <Select
              label="Source"
              options={[
                { value: 'Website', label: 'Website' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'Referral', label: 'Referral' },
              ]}
              {...register('source')}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}