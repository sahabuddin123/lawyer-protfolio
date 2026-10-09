import React from 'react';
import { cn } from '@/utils/cn';

export interface GoldDividerProps {
  className?: string;
  withEmblem?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const GoldDivider: React.FC<GoldDividerProps> = ({
  className,
  withEmblem = false,
  orientation = 'horizontal',
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-[1px] h-full bg-border-subtle self-stretch', className)}
      />
    );
  }

  if (withEmblem) {
    return (
      <div role="separator" aria-orientation="horizontal" className={cn('relative flex items-center justify-center my-8', className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <div className="relative px-4 bg-background-primary flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rotate-45 bg-gold-primary/60" />
          <span className="w-2 h-2 rotate-45 bg-gold-primary" />
          <span className="w-1.5 h-1.5 rotate-45 bg-gold-primary/60" />
        </div>
      </div>
    );
  }

  return (
    <hr
      className={cn('border-0 h-[1px] bg-border-subtle my-8', className)}
      aria-orientation="horizontal"
    />
  );
};
