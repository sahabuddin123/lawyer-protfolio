import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-gold-primary text-background-primary font-semibold hover:bg-gold-hover hover:shadow-gold-sm border border-gold-primary active:bg-gold-secondary',
      secondary:
        'bg-transparent text-gold-primary border border-gold-border hover:border-gold-primary hover:bg-gold-subtle hover:text-gold-hover',
      ghost:
        'bg-transparent text-text-primary hover:text-gold-primary hover:bg-surface-elevated border border-transparent',
      link:
        'bg-transparent text-gold-primary hover:text-gold-hover underline-offset-4 hover:underline p-0 h-auto border-0 focus-visible:ring-offset-0',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs tracking-wider uppercase px-3 py-1.5 rounded gap-1.5 min-h-[32px]',
      md: 'text-sm tracking-wide px-5 py-2.5 rounded gap-2 min-h-[42px]',
      lg: 'text-base tracking-wide px-7 py-3.5 rounded-md gap-2.5 min-h-[48px]',
    };

    const effectiveDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={effectiveDisabled}
        aria-busy={isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant !== 'link' && sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
