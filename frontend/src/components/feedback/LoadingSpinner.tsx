import React from 'react';
import { cn } from '@/utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading...',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div role="status" className="inline-flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'rounded-full border-border-subtle border-t-gold-primary animate-spin',
          sizeStyles[size],
          className
        )}
      />
      {label && <span className="text-xs text-text-muted font-mono">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );
};
