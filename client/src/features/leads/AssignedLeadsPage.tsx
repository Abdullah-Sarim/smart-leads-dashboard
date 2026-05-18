import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth';
import { leadsApi, LeadsTable, LeadFilters, LeadQueryParams, Lead, TableSkeleton, LeadStatus, LeadSource } from '../../features/leads';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination } from '../../components/common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck } from 'lucide-react';
import { isApiError } from '../../lib';

const leadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function AssignedLeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadQueryParams>({ sort: 'latest', page: 1 });

  const { register, handleSubmit, reset } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadsApi.getAssignedLeads(filters.page);
      let filteredLeads = res.leads;
      if (filters.status) {
        filteredLeads = filteredLeads.filter(l => l.status === filters.status);
      }
      if (filters.source) {
        filteredLeads = filteredLeads.filter(l => l.source === filters.source);
      }
      setLeads(filteredLeads);
      setMeta(res.meta);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to load assigned leads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handlePageChange = useCallback((page: number) => {
    setFilters(f => ({ ...f, page }));
  }, []);

  const onSubmit = (data: LeadFormValues) => {
    setFilters(f => ({ ...f, ...data, page: 1 }));
  };

  const handleFiltersChange = (newFilters: LeadQueryParams) => {
    setFilters(newFilters);
  };

  if (loading && leads.length === 0) return <FullPageLoader />;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 pt-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assigned Leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Leads assigned to you by admin</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col lg:flex-row lg:flex-wrap gap-3 lg:items-end">
          <div className="w-full sm:w-36">
            <select
              {...register('status')}
              onChange={(e) => {
                register('status').onChange(e);
                setFilters(f => ({ ...f, status: e.target.value as LeadStatus || undefined }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="">All Status</option>
              {Object.values(LeadStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-36">
            <select
              {...register('source')}
              onChange={(e) => {
                register('source').onChange(e);
                setFilters(f => ({ ...f, source: e.target.value as LeadSource || undefined }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="">All Sources</option>
              {Object.values(LeadSource).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-32">
            <select
              value={filters.sort || 'latest'}
              onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value as 'latest' | 'oldest', page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </form>

      {loading && leads.length > 0 ? (
        <div className="py-4"><TableSkeleton /></div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchLeads} />
      ) : leads.length === 0 ? (
        <EmptyState title="No assigned leads" message="You don't have any leads assigned to you yet" />
      ) : (
        <>
          <LeadsTable leads={leads} currentUser={user!} onEdit={() => {}} onDelete={() => {}} />
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}