import { TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import type { LeadStats } from './leads.types';

interface StatsCardsProps {
  stats: LeadStats | null;
  loading: boolean;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-7 w-12 bg-gray-200 rounded mb-1" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Leads" value={stats.total} icon={Users} color="bg-indigo-50 text-indigo-600" />
      <StatCard label="New Leads" value={stats.new} icon={TrendingUp} color="bg-blue-50 text-blue-600" />
      <StatCard label="Qualified" value={stats.qualified} icon={CheckCircle} color="bg-green-50 text-green-600" />
      <StatCard label="Lost" value={stats.lost} icon={XCircle} color="bg-red-50 text-red-600" />
    </div>
  );
}