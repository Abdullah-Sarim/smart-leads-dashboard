import { useState, useCallback } from 'react';
import { useAuth } from '../../features/auth';
import { leadsApi, LeadsTable, LeadFilters, LeadQueryParams, Lead } from '../../features/leads';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination, Button } from '../../components/common';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { isApiError } from '../../lib';
import toast from 'react-hot-toast';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email'),
  status: z.string().optional(),
  source: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function DashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadQueryParams>({ sort: 'latest', page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadsApi.getLeads(filters);
      setLeads(res.leads);
      setMeta(res.meta);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFiltersChange = useCallback((newFilters: LeadQueryParams) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await leadsApi.exportLeadsCsv(filters);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Export failed');
    }
  }, [filters]);

  const handleView = useCallback((lead: Lead) => {
    setEditingLead(lead);
    reset({ name: lead.name, email: lead.email, status: lead.status, source: lead.source });
    setShowForm(true);
  }, [reset]);

  const handleEdit = useCallback((lead: Lead) => {
    setEditingLead(lead);
    reset({ name: lead.name, email: lead.email, status: lead.status, source: lead.source });
    setShowForm(true);
  }, [reset]);

  const handleDelete = useCallback(async (lead: Lead) => {
    if (!confirm(`Delete ${lead.name}?`)) return;
    try {
      await leadsApi.deleteLead(lead._id);
      toast.success('Lead deleted');
      fetchLeads();
    } catch {
      toast.error('Delete failed');
    }
  }, [fetchLeads]);

  const onSubmit = async (data: LeadFormValues) => {
    setSubmitting(true);
    try {
      if (editingLead) {
        await leadsApi.updateLead(editingLead._id, data);
        toast.success('Lead updated');
      } else {
        await leadsApi.createLead(data);
        toast.success('Lead created');
      }
      setShowForm(false);
      setEditingLead(null);
      reset();
      fetchLeads();
    } catch {
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setEditingLead(null);
    reset({ name: '', email: '', status: 'New', source: 'Website' });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLead(null);
    reset();
  };

  if (loading && leads.length === 0) return <FullPageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">Manage and track your sales leads</p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      <LeadFilters filters={filters} onFiltersChange={handleFiltersChange} onExport={handleExport} total={meta.total} />

      {loading && leads.length > 0 && (
        <div className="flex justify-center py-4"><FullPageLoader /></div>
      )}

      {error ? (
        <ErrorMessage message={error} onRetry={fetchLeads} />
      ) : leads.length === 0 ? (
        <EmptyState title="No leads found" message="Try adjusting your filters or add a new lead" />
      ) : (
        <>
          <LeadsTable leads={leads} currentUser={user!} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseForm}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={submitting}>{editingLead ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <form className="space-y-3">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
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
        </form>
      </Modal>
    </div>
  );
}