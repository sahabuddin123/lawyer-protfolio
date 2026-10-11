import React from 'react';
import { cn } from '@/utils/cn';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterProps {
  options: FilterOption[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const Filter: React.FC<FilterProps> = ({
  options,
  activeId,
  onSelect,
  className,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Content filter tabs"
      className={cn('flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none', className)}
    >
      {options.map((option) => {
        const isActive = activeId === option.id;

        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(option.id)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer select-none',
              isActive
                ? 'bg-gold-primary text-background-primary shadow-gold-sm border border-gold-primary'
                : 'bg-surface border border-border-subtle text-text-secondary hover:border-gold-border hover:text-gold-primary'
            )}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={cn(
                  'ml-1.5 font-mono text-[11px] px-1.5 py-0.2 rounded-full',
                  isActive ? 'bg-black/20 text-background-primary' : 'bg-surface-elevated text-text-subtle'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
