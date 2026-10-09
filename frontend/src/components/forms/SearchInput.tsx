import React from 'react';
import { cn } from '@/utils/cn';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search...',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={cn('relative w-full', className)}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-subtle">
          <Search className="w-4 h-4 text-gold-primary" />
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-background-secondary text-text-primary text-sm rounded border border-border-subtle pl-10 pr-10 py-2.5 transition-colors placeholder:text-text-subtle/70 focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary"
          {...props}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
