import React from 'react';
import { Container } from './Container';
import { GoldDivider } from './Divider';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  breadcrumbs,
  className,
}) => {
  return (
    <div className={cn('relative pt-32 pb-16 bg-background-secondary border-b border-border-subtle', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-subtle/10 via-transparent to-transparent pointer-events-none" />
      <Container>
        {breadcrumbs && <div className="mb-6">{breadcrumbs}</div>}
        <div className="max-w-3xl">
          {eyebrow && (
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-[1px] bg-gold-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-gold-primary">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-text-primary tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </Container>
      <div className="mt-12">
        <GoldDivider withEmblem />
      </div>
    </div>
  );
};
