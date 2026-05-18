import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { leadsApi, LeadStatus, Lead } from './leads.types';
import { Badge, FullPageLoader, ErrorMessage } from '../../components/common';
import { isApiError } from '../../lib';

const statusVariant: Record<LeadStatus, 'blue' | 'yellow' | 'green' | 'red'> = {
  [LeadStatus.New]: 'blue',
  [LeadStatus.Contacted]: 'yellow',
  [LeadStatus.Qualified]: 'green',
  [LeadStatus.Lost]: 'red',
};

const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await leadsApi.getLeadById(id);
      setLead(data);
    } catch (err) {
      if (isApiError(err) && err.statusCode === 404) {
        setError('Lead not found');
      } else {
        setError(isApiError(err) ? err.message : 'Failed to load lead');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  if (loading) return <FullPageLoader />;

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchLead} />
        <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lead Details</h1>
          <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
        </div>

        <dl className="px-6">
          <DetailRow label="Name" value={<span className="font-medium">{lead.name}</span>} />
          <DetailRow label="Email" value={<a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">{lead.email}</a>} />
          <DetailRow label="Source" value={<Badge variant="default">{lead.source}</Badge>} />
          <DetailRow label="Created At" value={formatDate(lead.createdAt)} />
          <DetailRow label="Updated At" value={formatDate(lead.updatedAt)} />
        </dl>
      </div>
    </div>
  );
}