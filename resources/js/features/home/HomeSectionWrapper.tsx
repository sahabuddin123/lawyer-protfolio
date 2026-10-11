import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface HomeSectionWrapperProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionUrl?: string;
  children: React.ReactNode;
  className?: string;
  containerWide?: boolean;
}

export const HomeSectionWrapper: React.FC<HomeSectionWrapperProps> = ({
  id,
  eyebrow,
  title,
  description,
  actionLabel,
  actionUrl,
  children,
  className,
  containerWide = true,
}) => {
  const navigate = useNavigate();

  return (
    <section
      id={id}
      className={cn('py-20 md:py-28 border-b border-border-subtle relative bg-background-primary', className)}
    >
      <Container wide={containerWide}>
        {(eyebrow || title || description || (actionLabel && actionUrl)) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="max-w-3xl space-y-3">
              {eyebrow && (
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-gold-primary font-mono">
                    {eyebrow}
                  </span>
                </div>
              )}
              {title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-editorial font-bold text-text-primary tracking-tight leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {actionLabel && actionUrl && (
              <div className="shrink-0">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate(actionUrl)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {actionLabel}
                </Button>
              </div>
            )}
          </div>
        )}

        <div>{children}</div>
      </Container>
    </section>
  );
};
