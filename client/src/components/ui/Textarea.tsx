import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-[var(--bg-base)]/50 border rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none transition-colors glass-form min-h-[100px] resize-y',
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
Textarea.displayName = 'Textarea';
