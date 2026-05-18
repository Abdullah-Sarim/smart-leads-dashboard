import { useState, useCallback } from 'react';
import { useAuth } from '../../features/auth';
import { LeadsTable, LeadFilters, LeadQueryParams, Lead, TableSkeleton } from '../../features/leads';
import { StatsCards } from './StatsCards';
import { LeadFormModal } from './LeadFormModal';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination, Button, ConfirmDialog } from '../../components/common';
import { useLeads, useLeadStats, useDeleteLead } from '../../lib/queries';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<LeadQueryParams>({ sort: 'latest', page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const { data, isLoading, error, refetch } = useLeads(filters);
  const { data: stats, isLoading: statsLoading } = useLeadStats();
  const deleteLead = useDeleteLead();

  const leads = data?.leads ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };

  const handlePageChange = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: LeadQueryParams) => {
    setFilters(newFilters);
  }, []);

  const handleEdit = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setShowForm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteLead.mutateAsync(deleteTarget._id);
      toast.success('Lead deleted successfully');
      setDeleteTarget(null);
    } catch {
      toast.error('Delete failed');
    }
  }, [deleteTarget, deleteLead]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLead(null);
  };

  if (isLoading && leads.length === 0) return <FullPageLoader />;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your sales leads</p>
        </div>
        <Button onClick={() => { setEditingLead(null); setShowForm(true); }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      <StatsCards stats={stats} loading={statsLoading} />

      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 pb-3">
        <LeadFilters filters={filters} onFiltersChange={handleFiltersChange} onExport={() => {}} total={meta.total} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && leads.length > 0 ? (
          <div className="py-4"><TableSkeleton /></div>
        ) : error ? (
          <ErrorMessage message={(error as Error).message} onRetry={refetch} />
        ) : leads.length === 0 ? (
          <EmptyState title="No leads found" message="Try adjusting your filters or add a new lead" />
        ) : (
          <>
            <LeadsTable leads={leads} currentUser={user!} onEdit={handleEdit} onDelete={setDeleteTarget} />
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      <LeadFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingLead(null); }}
        editingLead={editingLead}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLead.isPending}
      />
    </div>
  );
}