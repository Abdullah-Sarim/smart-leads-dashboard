import { useState, useEffect } from 'react';
import { Modal, Button } from '../../components/common';
import { User } from '../../types';
import { usersApi } from '../auth/auth.api';
import { leadsApi, Lead } from '../leads';
import toast from 'react-hot-toast';
import { isApiError } from '../../lib';

interface AssignLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: () => void;
}

export function AssignLeadModal({ isOpen, onClose, lead, onSuccess }: AssignLeadModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(lead?.assignedTo || '');
      setLoading(true);
      usersApi.getAllUsers(1, 50)
        .then(res => setUsers(res.users.filter(u => u.role === 'sales' && u.isActive)))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, lead]);

  const handleAssign = async () => {
    if (!lead) return;
    setAssigning(true);
    try {
      await leadsApi.assignLead(lead._id, selectedUserId || null);
      toast.success(selectedUserId ? 'Lead assigned successfully' : 'Lead unassigned successfully');
      onSuccess();
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Assign failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Lead"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={assigning}>Cancel</Button>
          <Button onClick={handleAssign} loading={assigning}>Assign</Button>
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
          disabled={loading}
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