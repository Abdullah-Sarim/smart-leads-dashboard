import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title = 'No data', message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}