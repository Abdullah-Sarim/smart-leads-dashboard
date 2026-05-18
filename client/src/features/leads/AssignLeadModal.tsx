import { useState, useEffect } from 'react';
import { Modal, Button } from '../../components/common';
import { Lead } from '../leads';
import { useSalesUsers, useAssignLead } from '../../lib/queries';
import toast from 'react-hot-toast';

interface AssignLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: () => void;
}

export function AssignLeadModal({ isOpen, onClose, lead, onSuccess }: AssignLeadModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const { data: users = [], isLoading } = useSalesUsers();
  const assignLead = useAssignLead();

  useEffect(() => {
    if (isOpen && lead) {
      setSelectedUserId(lead.assignedTo || '');
    }
  }, [isOpen, lead]);

  const handleAssign = async () => {
    if (!lead) return;
    try {
      await assignLead.mutateAsync({ id: lead._id, assignedTo: selectedUserId || null });
      toast.success(selectedUserId ? 'Lead assigned successfully' : 'Lead unassigned successfully');
      onSuccess();
    } catch {
      toast.error('Assign failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Lead"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={assignLead.isPending}>Cancel</Button>
          <Button onClick={handleAssign} loading={assignLead.isPending}>Assign</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a sales user to assign <span className="font-semibold text-gray-900 dark:text-gray-100">{lead?.name}</span> to.
        </p>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        >
          <option value="">Unassign</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
          ))}
        </select>
      </div>
    </Modal>
  );
}