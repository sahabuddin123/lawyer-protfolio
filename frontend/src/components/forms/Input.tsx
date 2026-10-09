import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isSuccess?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      isSuccess = false,
      leftIcon,
      rightIcon,
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
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-subtle">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full bg-background-secondary text-text-primary text-sm rounded border px-3.5 py-2.5 transition-colors placeholder:text-text-subtle/70 focus:outline-none focus:ring-1',
              leftIcon && 'pl-10',
              (rightIcon || error || isSuccess) && 'pr-10',
              error
                ? 'border-status-error focus:border-status-error focus:ring-status-error'
                : isSuccess
                ? 'border-status-success focus:border-status-success focus:ring-status-success'
                : 'border-border-subtle focus:border-gold-primary focus:ring-gold-primary',
              disabled && 'opacity-50 cursor-not-allowed bg-surface',
              className
            )}
            {...props}
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            {error ? (
              <AlertCircle className="w-4 h-4 text-status-error" aria-hidden="true" />
            ) : isSuccess ? (
              <CheckCircle className="w-4 h-4 text-status-success" aria-hidden="true" />
            ) : (
              rightIcon
            )}
          </div>
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-status-error flex items-center gap-1">
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

Input.displayName = 'Input';
