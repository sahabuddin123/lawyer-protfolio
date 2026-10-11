import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-200 gap-4 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(actions || action) && (
        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          {actions}
          {action && (
            <Button
              variant="primary"
              onClick={action.onClick}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
