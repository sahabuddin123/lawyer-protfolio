import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      options,
      error,
      helperText,
      placeholder,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
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
          <select
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full appearance-none bg-background-secondary text-text-primary text-sm rounded border px-3.5 py-2.5 pr-10 transition-colors focus:outline-none focus:ring-1 cursor-pointer',
              error
                ? 'border-status-error focus:border-status-error focus:ring-status-error'
                : 'border-border-subtle focus:border-gold-primary focus:ring-gold-primary',
              disabled && 'opacity-50 cursor-not-allowed bg-surface',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-surface text-text-subtle">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-surface text-text-primary py-1"
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gold-primary">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
