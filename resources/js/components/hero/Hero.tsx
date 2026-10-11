import React from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LazyImage } from '@/components/ui/LazyImage';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface HeroProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  description: string;
  primaryCtaText?: string;
  onPrimaryCtaClick?: () => void;
  secondaryCtaText?: string;
  onSecondaryCtaClick?: () => void;
  portraitUrl?: string;
  portraitAlt?: string;
  portraitObjectPosition?: string;
  credentialsBadge?: string;
  experienceBadge?: string;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow,
  title,
  subtitle,
  description,
  primaryCtaText = 'Request Chamber Consultation',
  onPrimaryCtaClick,
  secondaryCtaText = 'Explore Practice Domains',
  onSecondaryCtaClick,
  portraitUrl,
  portraitAlt = 'Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh',
  portraitObjectPosition = 'top center',
  credentialsBadge,
  experienceBadge,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative min-h-[90vh] flex items-center pt-28 pb-16 md:py-36 bg-background-primary overflow-hidden border-b border-border-subtle',
        className
      )}
    >
      {/* Background Architectural Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(212,160,23,0.06),_transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Container wide>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Column 1: Editorial Authority Narrative */}
          <div className="lg:col-span-7 xl:col-span-7 z-10 space-y-6">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-gold-border/60">
                <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-widest uppercase text-gold-primary">
                  {eyebrow}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-cinzel font-bold text-text-primary tracking-tight leading-[1.12]">
                {title}
              </h1>

              {subtitle && (
                <p className="text-lg sm:text-xl font-serif-editorial text-gold-secondary font-medium italic">
                  {subtitle}
                </p>
              )}
            </div>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed font-normal max-w-2xl">
              {description}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {primaryCtaText && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onPrimaryCtaClick}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {primaryCtaText}
                </Button>
              )}

              {secondaryCtaText && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onSecondaryCtaClick}
                >
                  {secondaryCtaText}
                </Button>
              )}
            </div>

            {/* Badges Strip */}
            <div className="pt-6 border-t border-border-subtle/80 flex flex-wrap items-center gap-6 text-xs text-text-secondary">
              {credentialsBadge && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span className="font-medium">{credentialsBadge}</span>
                </div>
              )}

              {experienceBadge && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold-primary shrink-0" />
                  <span className="font-medium">{experienceBadge}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Large Professional Portrait */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Gold Rim Frame & Background Glow */}
              <div className="relative rounded-2xl overflow-hidden border border-gold-border/50 bg-surface-elevated shadow-dark-card group">
                {portraitUrl ? (
                  <LazyImage
                    src={portraitUrl}
                    alt={portraitAlt}
                    aspectRatio="3/4"
                    objectPosition={portraitObjectPosition}
                    priority
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                ) : (
                  <div className="aspect-[3/4] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-surface-elevated via-surface to-background-secondary">
                    <div className="w-24 h-24 rounded-full border border-gold-border flex items-center justify-center text-gold-primary mb-6 shadow-gold-sm">
                      <ShieldCheck className="w-12 h-12" />
                    </div>
                    <span className="font-cinzel text-xl text-text-primary font-bold block mb-1">
                      Nijam Uddin (Haq)
                    </span>
                    <span className="text-xs text-gold-secondary font-mono block">
                      Advocate, Supreme Court of Bangladesh
                    </span>
                    <span className="text-xs text-text-muted mt-4 max-w-xs">
                      LL.B. (Honours), LL.M., University of Chittagong
                    </span>
                  </div>
                )}

                {/* Subtle Inner Border Gradient */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background-primary via-background-primary/40 to-transparent pointer-events-none" />
              </div>

              {/* Status Tag Floater */}
              <div className="absolute -bottom-4 -left-4 sm:left-4 bg-surface-elevated/95 backdrop-blur-md border border-gold-border p-3.5 rounded-lg shadow-gold-md hidden sm:flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-status-success animate-ping" />
                <div>
                  <span className="text-xs font-semibold text-text-primary block">
                    Bangladesh Bar Council
                  </span>
                  <span className="text-[10px] text-text-muted font-mono block">
                    Enrolled Supreme Court Advocate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
