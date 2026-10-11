import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ id, label, error, helperText, className, disabled, required, ...props }, ref) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-wider uppercase text-text-secondary mb-2 select-none"
          >
            {label}
            {required && <span className="text-gold-primary ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="date"
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full bg-background-secondary text-text-primary text-sm rounded border px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-1 [color-scheme:dark]',
              error
                ? 'border-status-error focus:border-status-error focus:ring-status-error'
                : 'border-border-subtle focus:border-gold-primary focus:ring-gold-primary',
              disabled && 'opacity-50 cursor-not-allowed bg-surface',
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-status-error flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-text-subtle">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
