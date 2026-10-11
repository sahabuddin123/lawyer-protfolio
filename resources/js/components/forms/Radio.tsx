import React from 'react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary mb-2.5 select-none">
          {label}
        </label>
      )}

      <div className="space-y-2.5">
        {options.map((option) => {
          const isSelected = value === option.value;
          const optionId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none group',
                isSelected
                  ? 'bg-surface-elevated border-gold-border'
                  : 'bg-surface border-border-subtle hover:border-border-medium',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={() => onChange?.(option.value)}
                  className="sr-only peer"
                />
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border border-border-subtle bg-surface transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-gold-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background-primary',
                    isSelected && 'border-gold-primary'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-gold-primary" />}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-text-primary block leading-tight">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-text-muted mt-1 block">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p className="mt-1.5 text-xs text-status-error">{error}</p>}
    </div>
  );
};
