import React from 'react';
import { cn } from '@/utils/cn';
import { FolderSearch } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-12 text-center rounded-lg border border-dashed border-border-subtle bg-surface/50 flex flex-col items-center justify-center max-w-lg mx-auto my-8',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center text-gold-primary mb-4">
        {icon || <FolderSearch className="w-7 h-7 stroke-[1.5]" />}
      </div>

      <h3 className="text-lg font-serif-editorial font-bold text-text-primary mb-2">
        {title}
      </h3>

      <p className="text-sm text-text-muted leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
