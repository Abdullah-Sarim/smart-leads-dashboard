import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronLeft className="w-5 h-5" />
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pageNum = i + 1;
        if (totalPages > 5) {
          if (page > 3) pageNum = page - 2 + i;
          if (page > totalPages - 2) pageNum = totalPages - 4 + i;
        }
        return (
          <button key={pageNum} onClick={() => onPageChange(pageNum)} className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === pageNum ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
            {pageNum}
          </button>
        );
      })}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}