import React from 'react';
import { cn } from '@/utils/cn';

export type SectionBackground = 'primary' | 'secondary' | 'surface';
export type SectionSpacing = 'sm' | 'md' | 'lg';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: SectionBackground;
  spacing?: SectionSpacing;
  hasBorderBottom?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  background = 'primary',
  spacing = 'md',
  hasBorderBottom = false,
  className,
  ...props
}) => {
  const bgStyles: Record<SectionBackground, string> = {
    primary: 'bg-background-primary',
    secondary: 'bg-background-secondary',
    surface: 'bg-background-surface',
  };

  const spacingStyles: Record<SectionSpacing, string> = {
    sm: 'py-10 md:py-14',
    md: 'py-16 md:py-20 lg:py-24',
    lg: 'py-20 md:py-28 lg:py-32',
  };

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden transition-colors',
        bgStyles[background],
        spacingStyles[spacing],
        hasBorderBottom && 'border-b border-border-subtle',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};
