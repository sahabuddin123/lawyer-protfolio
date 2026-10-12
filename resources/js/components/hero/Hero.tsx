import React from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LazyImage } from '@/components/ui/LazyImage';
import { ShieldCheck, Award, ArrowRight, Landmark } from 'lucide-react';
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
  districtCourtBadge?: string;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow: _eyebrow,
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
  districtCourtBadge,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative min-h-[620px] lg:min-h-[700px] flex items-center pt-28 pb-16 md:py-24 bg-background-primary overflow-hidden border-b border-border-subtle',
        className
      )}
    >
      {/* Background Architectural Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(212,160,23,0.06),_transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Container wide>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Column 1: Editorial Authority Narrative (Mobile: Order 2, Desktop: Order 1) */}
          <div className="lg:col-span-7 xl:col-span-7 z-10 space-y-6 order-2 lg:order-1">
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

              {districtCourtBadge && (
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-gold-primary shrink-0" />
                  <span className="font-medium">{districtCourtBadge}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Large Professional Portrait (Mobile: Order 1, Desktop: Order 2) */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end relative order-1 lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none">
              {/* Outer Golden Ambient Halo */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-600/5 to-transparent blur-xl pointer-events-none" />

              {/* Gold Rim Frame & Background Glow */}
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-900 shadow-2xl group">
                <LazyImage
                  src={portraitUrl || '/images/portrait-nijamuddin.jpg'}
                  fallbackSrc="/images/portrait-nijamuddin.jpg"
                  alt={portraitAlt}
                  aspectRatio="3/4"
                  objectPosition={portraitObjectPosition}
                  priority
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />

                {/* Subtle Inner Border Gradient */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                {/* Bottom Verification Badge Overlay */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md border border-amber-500/30 px-3.5 py-2.5 rounded-xl shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <span className="text-xs font-semibold text-slate-100 block leading-tight">
                        Advocate Nijam Uddin (Haq)
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono block leading-tight">
                        Supreme Court of Bangladesh
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded font-mono">
                    Bar Council
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
