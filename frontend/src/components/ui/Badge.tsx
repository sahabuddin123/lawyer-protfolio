import React from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'gold' | 'neutral' | 'success' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'gold',
  size = 'md',
  icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium tracking-wider uppercase transition-colors select-none rounded-full';

  const variantStyles: Record<BadgeVariant, string> = {
    gold: 'bg-gold-subtle border border-gold-border text-gold-primary',
    neutral: 'bg-surface-elevated border border-border-subtle text-text-muted',
    success: 'bg-status-success/10 border border-status-success/30 text-status-success',
    outline: 'border border-border-subtle text-text-secondary bg-transparent',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
