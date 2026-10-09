import React from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, error, checked, className, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('flex flex-col', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-start gap-3 cursor-pointer select-none group',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                'w-4 h-4 rounded border border-border-subtle bg-surface transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-gold-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background-primary',
                checked ? 'bg-gold-primary border-gold-primary text-background-primary' : 'group-hover:border-gold-border',
                error && 'border-status-error'
              )}
            >
              {checked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          <span className="text-sm text-text-secondary leading-snug group-hover:text-text-primary transition-colors">
            {label}
          </span>
        </label>

        {error && <p className="mt-1 text-xs text-status-error pl-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
