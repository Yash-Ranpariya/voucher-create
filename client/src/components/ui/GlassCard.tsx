import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass relative overflow-hidden',
          interactive && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(31,38,135,0.15)] hover:border-white',
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
