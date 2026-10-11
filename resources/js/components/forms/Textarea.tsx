import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      maxLength,
      showCharCount = false,
      value,
      className,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold tracking-wider uppercase text-text-secondary select-none"
            >
              {label}
              {required && <span className="text-gold-primary ml-1" aria-hidden="true">*</span>}
            </label>
          )}

          {showCharCount && maxLength && (
            <span className="text-xs font-mono text-text-subtle">
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full bg-background-secondary text-text-primary text-sm rounded border px-3.5 py-2.5 transition-colors placeholder:text-text-subtle/70 focus:outline-none focus:ring-1 resize-y',
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

Textarea.displayName = 'Textarea';
