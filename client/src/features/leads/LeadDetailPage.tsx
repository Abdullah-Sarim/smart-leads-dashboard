import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Mail, Megaphone, UserRound } from 'lucide-react';
import { leadsApi } from './leads.api';
import { LeadStatus, Lead } from './leads.types';
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    if (!id) {
      setLead(null);
      setError('Lead not found');
      setLoading(false);
      return;
    }
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
      <div className="max-w-2xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchLead} />
        <Link to="/leads" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-4 py-5 dark:border-gray-800 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Lead profile</p>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{lead.name}</h1>
              <a href={`mailto:${lead.email}`} className="mt-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                <Mail className="h-4 w-4" />
                {lead.email}
              </a>
            </div>
            <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
          </div>
        </div>

        <dl className="px-4 sm:px-6">
          <DetailRow label="Name" value={<span className="inline-flex items-center gap-2 font-medium"><UserRound className="h-4 w-4 text-gray-400" />{lead.name}</span>} />
          <DetailRow label="Email" value={<a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 text-indigo-600 hover:underline"><Mail className="h-4 w-4" />{lead.email}</a>} />
          <DetailRow label="Source" value={<span className="inline-flex items-center gap-2"><Megaphone className="h-4 w-4 text-gray-400" /><Badge variant="default">{lead.source}</Badge></span>} />
          <DetailRow label="Created At" value={<span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" />{formatDate(lead.createdAt)}</span>} />
          <DetailRow label="Updated At" value={<span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" />{formatDate(lead.updatedAt)}</span>} />
        </dl>
      </div>
    </div>
  );
}
