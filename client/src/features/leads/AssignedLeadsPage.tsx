import { useState, useCallback } from 'react';
import { useAuth } from '../../features/auth';
import { LeadsTable, LeadFilters, LeadQueryParams, TableSkeleton, LeadStatus, LeadSource } from '../../features/leads';
import { FullPageLoader, EmptyState, ErrorMessage, Pagination } from '../../components/common';
import { useAssignedLeads } from '../../lib/queries';
import { UserCheck } from 'lucide-react';

export function AssignedLeadsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LeadQueryParams>({ sort: 'latest', page: 1 });

  const { data, isLoading, error, refetch } = useAssignedLeads(page);

  const allLeads = data?.leads ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };

  const filteredLeads = allLeads.filter(l => {
    if (filters.status && l.status !== filters.status) return false;
    if (filters.source && l.source !== filters.source) return false;
    return true;
  });

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    setFilters(f => ({ ...f, page: p }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: LeadQueryParams) => {
    setFilters(newFilters);
  }, []);

  if (isLoading && allLeads.length === 0) return <FullPageLoader />;

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

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col lg:flex-row lg:flex-wrap gap-3 lg:items-end mb-4">
        <div className="w-full sm:w-36">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as LeadStatus || undefined, page: 1 }))}
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
            value={filters.source || ''}
            onChange={(e) => setFilters(f => ({ ...f, source: e.target.value as LeadSource || undefined, page: 1 }))}
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

      <div className="flex-1 overflow-y-auto">
        {isLoading && allLeads.length > 0 ? (
          <div className="py-4"><TableSkeleton /></div>
        ) : error ? (
          <ErrorMessage message={(error as Error).message} onRetry={refetch} />
        ) : filteredLeads.length === 0 ? (
          <EmptyState title="No assigned leads" message="You don't have any leads assigned to you yet" />
        ) : (
          <>
            <LeadsTable leads={filteredLeads} currentUser={user!} onEdit={() => {}} onDelete={() => {}} />
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}