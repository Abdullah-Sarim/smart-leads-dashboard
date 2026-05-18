import { useState, useEffect, type ChangeEvent } from 'react';
import { Search, Download } from 'lucide-react';
import { Select, Button } from '../../components/common';
import { LeadStatus, LeadSource, LeadQueryParams } from './leads.types';
import { useDebounce } from '../../hooks/useDebounce';

interface LeadFiltersProps {
  filters: LeadQueryParams;
  onFiltersChange: (filters: LeadQueryParams) => void;
  onExport: () => void;
  total: number;
}

export function LeadFilters({ filters, onFiltersChange, onExport, total }: LeadFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleChange = (key: keyof LeadQueryParams, value: string) => {
    const updated = { ...filters, [key]: value || undefined, page: 1 };
    onFiltersChange(updated);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="w-36">
        <Select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: '', label: 'All Status' },
            ...Object.values(LeadStatus).map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      <div className="w-36">
        <Select
          value={filters.source || ''}
          onChange={(e) => handleChange('source', e.target.value)}
          options={[
            { value: '', label: 'All Sources' },
            ...Object.values(LeadSource).map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      <div className="w-32">
        <Select
          value={filters.sort || 'latest'}
          onChange={(e) => handleChange('sort', e.target.value)}
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'oldest', label: 'Oldest' },
          ]}
        />
      </div>

      <Button variant="secondary" onClick={onExport} title="Export CSV">
        <Download className="w-4 h-4" />
      </Button>

      <div className="text-sm text-gray-500">{total} leads</div>
    </div>
  );
}