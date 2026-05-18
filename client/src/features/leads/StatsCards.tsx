import { TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import type { LeadStats } from './leads.types';

interface StatsCardsProps {
  stats: LeadStats | null | undefined;
  loading: boolean;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse dark:border-gray-800 dark:bg-gray-900 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
      <StatCard label="Total Leads" value={stats.total} icon={Users} color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
      <StatCard label="New Leads" value={stats.new} icon={TrendingUp} color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
      <StatCard label="Qualified" value={stats.qualified} icon={CheckCircle} color="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
      <StatCard label="Lost" value={stats.lost} icon={XCircle} color="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
    </div>
  );
}
