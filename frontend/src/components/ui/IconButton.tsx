import React from 'react';
import { cn } from '@/utils/cn';

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', icon, 'aria-label': ariaLabel, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95';

    const variantStyles: Record<IconButtonVariant, string> = {
      ghost: 'text-text-muted hover:text-gold-primary hover:bg-surface-elevated',
      secondary: 'border border-border-subtle bg-surface text-text-primary hover:border-gold-border hover:text-gold-primary hover:bg-surface-hover',
      primary: 'bg-gold-primary text-background-primary hover:bg-gold-hover border border-gold-primary',
    };

    const sizeStyles: Record<IconButtonSize, string> = {
      sm: 'w-8 h-8 p-1 min-w-[36px] min-h-[36px]',
      md: 'w-11 h-11 p-2.5 min-w-[44px] min-h-[44px]', // WCAG AAA 44x44 touch target
      lg: 'w-12 h-12 p-3 min-w-[48px] min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
