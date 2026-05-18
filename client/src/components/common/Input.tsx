import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}