import React from 'react';
import { cn } from '@/utils/cn';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  action,
  className,
}) => {
  const isCentered = align === 'center';

  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        isCentered ? 'text-center max-w-3xl mx-auto' : 'flex flex-col md:flex-row md:items-end md:justify-between gap-6',
        className
      )}
    >
      <div className={cn(isCentered ? 'w-full' : 'max-w-2xl')}>
        {eyebrow && (
          <div className={cn('flex items-center gap-2 mb-3', isCentered && 'justify-center')}>
            <span className="w-6 h-[1px] bg-gold-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-gold-primary">
              {eyebrow}
            </span>
            <span className="w-6 h-[1px] bg-gold-primary" />
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-bold text-text-primary tracking-tight leading-tight">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>

      {!isCentered && action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
