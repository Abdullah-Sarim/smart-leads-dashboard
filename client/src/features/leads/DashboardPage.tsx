import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth';
import { leadsApi, LeadsTable, LeadFilters, LeadQueryParams, Lead, LeadStats, TableSkeleton } from '../../features/leads';
import { StatsCards } from './StatsCards';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination, Button } from '../../components/common';
import { Modal, ConfirmDialog } from '../../components/common';
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
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadQueryParams>({ sort: 'latest', page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await leadsApi.getStats();
      setStats(data);
    } catch {
      // Stats are non-critical, silently fail
    } finally {
      setStatsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFiltersChange = useCallback((newFilters: LeadQueryParams) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await leadsApi.exportLeadsCsv(filters);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const handleEdit = useCallback((lead: Lead) => {
    setEditingLead(lead);
    reset({ name: lead.name, email: lead.email, status: lead.status, source: lead.source });
    setShowForm(true);
  }, [reset]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await leadsApi.deleteLead(deleteTarget._id);
      toast.success('Lead deleted successfully');
      setDeleteTarget(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchLeads, fetchStats]);

  const onSubmit = async (data: LeadFormValues) => {
    setSubmitting(true);
    try {
      if (editingLead) {
        await leadsApi.updateLead(editingLead._id, data);
        toast.success('Lead updated successfully');
      } else {
        await leadsApi.createLead(data);
        toast.success('Lead created successfully');
      }
      setShowForm(false);
      setEditingLead(null);
      reset();
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Operation failed');
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

      <StatsCards stats={stats} loading={statsLoading} />

      <LeadFilters filters={filters} onFiltersChange={handleFiltersChange} onExport={handleExport} total={meta.total} />

      {loading && leads.length > 0 && (
        <div className="py-4"><TableSkeleton /></div>
      )}

      {error ? (
        <ErrorMessage message={error} onRetry={fetchLeads} />
      ) : leads.length === 0 ? (
        <EmptyState title="No leads found" message="Try adjusting your filters or add a new lead" />
      ) : (
        <>
          <LeadsTable leads={leads} currentUser={user!} onEdit={handleEdit} onDelete={setDeleteTarget} />
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseForm} disabled={submitting}>Cancel</Button>
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}