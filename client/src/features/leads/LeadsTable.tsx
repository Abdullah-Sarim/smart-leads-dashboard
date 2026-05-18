import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Eye, UserPlus } from 'lucide-react';
import { Badge } from '../../components/common';
import { Lead, LeadStatus } from './leads.types';
import type { User } from '../../types';

interface LeadsTableProps {
  leads: Lead[];
  currentUser: User;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onAssign?: (lead: Lead) => void;
}

const statusVariant: Record<LeadStatus, 'blue' | 'yellow' | 'green' | 'red'> = {
  [LeadStatus.New]: 'blue',
  [LeadStatus.Contacted]: 'yellow',
  [LeadStatus.Qualified]: 'green',
  [LeadStatus.Lost]: 'red',
};

const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

export function LeadsTable({ leads, currentUser, onEdit, onDelete, onAssign }: LeadsTableProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {leads.map((lead) => (
          <article key={lead._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">{lead.name}</h3>
                <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                {lead.assignedTo && (
                  <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    Assigned
                  </span>
                )}
              </div>
              <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Source</p>
                <div className="mt-1">
                  <Badge variant="default">{lead.source}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Created</p>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{formatDate(lead.createdAt)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button type="button" onClick={() => navigate(`/leads/${lead._id}`)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
                <Eye className="w-4 h-4" /> View
              </button>
              <button type="button" onClick={() => onEdit(lead)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              {currentUser.role === 'admin' && (
                <>
                  <button type="button" onClick={() => onAssign?.(lead)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20">
                    <UserPlus className="w-4 h-4" /> Assign
                  </button>
                  <button type="button" onClick={() => onDelete(lead)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {['Name', 'Email', 'Status', 'Source', 'Assigned', 'Created At'].map((col) => (
              <th key={col} className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">{col}</th>
            ))}
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{lead.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{lead.email}</td>
              <td className="py-3 px-4">
                <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant="default">{lead.source}</Badge>
              </td>
              <td className="py-3 px-4">
                {lead.assignedTo ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    Assigned
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Unassigned</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-500">{formatDate(lead.createdAt)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => navigate(`/leads/${lead._id}`)} className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onEdit(lead)} className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {currentUser.role === 'admin' && (
                    <>
                      <button type="button" onClick={() => onAssign?.(lead)} className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20" title="Assign">
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onDelete(lead)} className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
