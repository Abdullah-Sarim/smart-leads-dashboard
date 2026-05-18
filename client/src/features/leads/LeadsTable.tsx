import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Badge } from '../../components/common';
import { Lead, LeadStatus } from './leads.types';
import type { User } from '../../types';

interface LeadsTableProps {
  leads: Lead[];
  currentUser: User;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
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

export function LeadsTable({ leads, currentUser, onEdit, onDelete }: LeadsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {['Name', 'Email', 'Status', 'Source', 'Created At'].map((col) => (
              <th key={col} className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{col}</th>
            ))}
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{lead.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{lead.email}</td>
              <td className="py-3 px-4">
                <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant="default">{lead.source}</Badge>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => navigate(`/leads/${lead._id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(lead)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {currentUser.role === 'admin' && (
                    <button onClick={() => onDelete(lead)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}