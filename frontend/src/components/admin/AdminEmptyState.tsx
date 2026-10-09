import React, { ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 text-slate-400">
        {icon || <FolderOpen className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 py-2 rounded-lg text-sm shadow-sm transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
