import { useState, useEffect } from 'react';
import { leadService } from '../services';
import { useDebounce } from '../hooks';
import { LeadForm, LeadsTable, FilterBar, Pagination } from '../components/leads';
import { LoadingState, EmptyState, ErrorState } from '../components/common';
import type { Lead, LeadStatus, LeadSource, PaginationMeta } from '../types';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [source, setSource] = useState<LeadSource | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebounce(search, 500);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await leadService.getLeads({
        page: meta.page,
        limit: 10,
        search: debouncedSearch,
        status: status || undefined,
        source: source || undefined,
        sortBy: 'createdAt',
        order: sortOrder,
      });
      setLeads(result.leads);
      setMeta(result.meta);
    } catch {
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [debouncedSearch, status, source, sortOrder, meta.page]);

  const handleSubmit = async (data: { name: string; email: string; status?: LeadStatus; source?: LeadSource }) => {
    if (editingLead) {
      await leadService.updateLead(editingLead._id, data);
    } else {
      await leadService.createLead(data);
    }
    setEditingLead(null);
    fetchLeads();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await leadService.deleteLead(id);
      toast.success('Lead deleted');
      fetchLeads();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await leadService.exportCSV({ search: debouncedSearch, status: status || undefined, source: source || undefined, sortBy: 'createdAt', order: sortOrder });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads Dashboard</h1>
        <p className="text-gray-500">Manage and track your sales leads</p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        source={source}
        onSourceChange={setSource}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onAddClick={() => setShowForm(true)}
        onExport={handleExport}
        meta={meta}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLeads} />
      ) : leads.length === 0 ? (
        <EmptyState message={search || status || source ? 'No leads match your filters' : 'No leads yet. Add your first lead!'} />
      ) : (
        <>
          <LeadsTable leads={leads} onEdit={(lead) => { setEditingLead(lead); setShowForm(true); }} onDelete={handleDelete} />
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(page) => setMeta({ ...meta, page })} />
        </>
      )}

      {(showForm || editingLead) && (
        <LeadForm
          initialData={editingLead || undefined}
          isEdit={!!editingLead}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingLead(null); }}
        />
      )}
    </div>
  );
}