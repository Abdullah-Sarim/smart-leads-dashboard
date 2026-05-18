import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth';
import { leadsApi, LeadsTable, LeadFilters, LeadQueryParams, Lead, TableSkeleton, LeadStatus, LeadSource } from '../../features/leads';
import { usersApi } from '../../features/auth/auth.api';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination, Button } from '../../components/common';
import { Modal, ConfirmDialog } from '../../components/common';
import { Input, Select } from '../../components/common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UserRound, CircleDot, UserPlus } from 'lucide-react';
import { isApiError } from '../../lib';
import toast from 'react-hot-toast';
import type { User } from '../../types';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email'),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
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
  const [assignTarget, setAssignTarget] = useState<Lead | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning] = useState(false);

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

  const fetchUsers = useCallback(async () => {
    try {
      const res = await usersApi.getAllUsers(1, 50);
      setUsers(res.users.filter(u => u.role === 'sales' && u.isActive));
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [fetchUsers, user?.role]);

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
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchLeads]);

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
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setEditingLead(null);
    reset({ name: '', email: '', status: LeadStatus.New, source: LeadSource.Website });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLead(null);
    reset();
  };

  const handleAssign = (lead: Lead) => {
    setAssignTarget(lead);
    setSelectedUserId(lead.assignedTo || '');
  };

  const handleAssignConfirm = async () => {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      await leadsApi.assignLead(assignTarget._id, selectedUserId || null);
      toast.success(selectedUserId ? 'Lead assigned successfully' : 'Lead unassigned successfully');
      setAssignTarget(null);
      fetchLeads();
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Assign failed');
    } finally {
      setAssigning(false);
    }
  };

  if (loading && leads.length === 0) return <FullPageLoader />;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View, search, and manage all leads</p>
        </div>
        <Button onClick={handleOpenForm} loading={submitting} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 pb-3">
        <LeadFilters filters={filters} onFiltersChange={handleFiltersChange} onExport={handleExport} total={meta.total} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && leads.length > 0 ? (
          <div className="py-4"><TableSkeleton /></div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchLeads} />
        ) : leads.length === 0 ? (
          <EmptyState title="No leads found" message="Try adjusting your filters or add a new lead" />
        ) : (
          <>
            <LeadsTable leads={leads} currentUser={user!} onEdit={handleEdit} onDelete={setDeleteTarget} onAssign={handleAssign} />
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

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
        <form className="space-y-5">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-300">
            {editingLead
              ? 'Update the lead information and keep the pipeline current.'
              : 'Add a new lead with the details your team needs to follow up quickly.'}
          </div>

          <div className="grid gap-4">
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
          </div>
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

      <Modal
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title="Assign Lead"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignTarget(null)} disabled={assigning}>Cancel</Button>
            <Button onClick={handleAssignConfirm} loading={assigning}>Assign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a sales user to assign <span className="font-semibold text-gray-900 dark:text-gray-100">{assignTarget?.name}</span> to.
          </p>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <option value="">Unassign</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}