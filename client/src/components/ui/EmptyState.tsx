import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, className, ...props }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)} {...props}>
      <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center text-white/40">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-medium text-white mb-1 font-['Plus_Jakarta_Sans']">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm">
        {description}
      </p>
    </div>
  );
};
