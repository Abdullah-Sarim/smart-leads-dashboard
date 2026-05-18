import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth';
import { leadsApi, LeadsTable, LeadFilters, LeadQueryParams, Lead, TableSkeleton } from '../../features/leads';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination, Button } from '../../components/common';
import { ConfirmDialog } from '../../components/common';
import { LeadFormModal } from './LeadFormModal';
import { AssignLeadModal } from './AssignLeadModal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { isApiError } from '../../lib';

export function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadQueryParams>({ sort: 'latest', page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Lead | null>(null);

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

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: LeadQueryParams) => {
    setFilters(newFilters);
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
    setShowForm(true);
  }, []);

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

  const handleOpenForm = () => {
    setEditingLead(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLead(null);
  };

  if (loading && leads.length === 0) return <FullPageLoader />;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View, search, and manage all leads</p>
        </div>
        <Button onClick={handleOpenForm} className="w-full sm:w-auto">
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
            <LeadsTable leads={leads} currentUser={user!} onEdit={handleEdit} onDelete={setDeleteTarget} onAssign={setAssignTarget} />
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      <LeadFormModal
        isOpen={showForm}
        onClose={handleFormClose}
        editingLead={editingLead}
        onSuccess={() => { handleFormClose(); fetchLeads(); }}
      />

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

      <AssignLeadModal
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        lead={assignTarget}
        onSuccess={() => { setAssignTarget(null); fetchLeads(); }}
      />
    </div>
  );
}