import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={selectId}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}