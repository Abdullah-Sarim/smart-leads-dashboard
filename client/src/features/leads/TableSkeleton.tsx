export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="animate-pulse">
        <div className="flex gap-4 px-4 py-3 border-b border-gray-200">
          {[100, 140, 80, 80, 120, 80].map((w, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: w }} />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
            {[120, 160, 60, 60, 120, 60].map((w, j) => (
              <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}