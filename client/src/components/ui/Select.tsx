import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full bg-[var(--bg-base)] border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors appearance-none glass-form',
            error ? 'border-[var(--danger)] focus:border-[var(--danger)]' : 'border-white/10 focus:border-[var(--accent-primary)]',
            className
          )}
          {...props}
        >
          <option value="" disabled className="bg-[#0B1020] text-white/50">Select an option</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#0B1020] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[var(--danger)] text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
