import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full bg-[var(--bg-base)]/50 border rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none transition-colors glass-form',
            error ? 'border-[var(--danger)] focus:border-[var(--danger)]' : 'border-white/10 focus:border-[var(--accent-primary)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-[var(--danger)] text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
