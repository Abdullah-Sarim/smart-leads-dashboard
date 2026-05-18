import { Search, Filter, Download, Plus, ArrowUpDown } from 'lucide-react';
import { Button, Select } from '../common';
import type { LeadStatus, LeadSource, PaginationMeta } from '../../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: LeadStatus | '';
  onStatusChange: (v: LeadStatus | '') => void;
  source: LeadSource | '';
  onSourceChange: (v: LeadSource | '') => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (v: 'asc' | 'desc') => void;
  onAddClick: () => void;
  onExport: () => void;
  meta?: PaginationMeta;
}

export function FilterBar({ search, onSearchChange, status, onStatusChange, source, onSourceChange, sortOrder, onSortChange, onAddClick, onExport, meta }: FilterBarProps) {
  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="input pl-10" />
          </div>
        </div>
        <div className="w-40">
          <Select value={status} onChange={(e) => onStatusChange(e.target.value as LeadStatus | '')} options={[{ value: '', label: 'All Status' }, ...Object.values(LeadStatus).map((s) => ({ value: s, label: s }))]} />
        </div>
        <div className="w-40">
          <Select value={source} onChange={(e) => onSourceChange(e.target.value as LeadSource | '')} options={[{ value: '', label: 'All Sources' }, ...Object.values(LeadSource).map((s) => ({ value: s, label: s }))]} />
        </div>
        <Button variant="secondary" onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}>
          <ArrowUpDown className="w-4 h-4 mr-1" /> {sortOrder === 'asc' ? 'Oldest' : 'Latest'}
        </Button>
        <Button variant="secondary" onClick={onExport} title="Export CSV"><Download className="w-4 h-4" /></Button>
        <Button onClick={onAddClick}><Plus className="w-4 h-4 mr-1" /> Add Lead</Button>
      </div>
      {meta && <p className="text-sm text-gray-500 mt-2">Showing {meta.total} leads</p>}
    </div>
  );
}