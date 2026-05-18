import type { Lead } from '../../types';
import { Pencil, Trash2, Mail, User } from 'lucide-react';
import { statusColors, sourceColors } from '../../utils';
import { formatDate } from '../../utils/helpers';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export function LeadsTable({ leads, onEdit, onDelete }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Source</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Created</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-gray-900">{lead.name}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {lead.email}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                  {lead.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[lead.source]}`}>
                  {lead.source}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(lead)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(lead._id)} className="p-1.5 text-gray-500 hover:text-danger hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}