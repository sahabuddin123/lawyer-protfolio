import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Mail, Calendar } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cmsApi } from '@/api/cms';

export interface GlobalCtaProps {
  onConsultationClick?: () => void;
  className?: string;
}

export interface GlobalCtaConfig {
  is_enabled?: boolean;
  heading?: { en?: string; bn?: string };
  subheading?: { en?: string; bn?: string };
  primary_button_label?: { en?: string; bn?: string };
  primary_button_url?: string;
  secondary_button_label?: { en?: string; bn?: string };
  secondary_button_url?: string;
}

export const GlobalCta: React.FC<GlobalCtaProps> = ({
  onConsultationClick,
  className = '',
}) => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [config, setConfig] = useState<GlobalCtaConfig | null>(null);

  useEffect(() => {
    let isMounted = true;
    cmsApi
      .getPublicSettings('cta')
      .then((settings) => {
        if (isMounted) {
          const ctaData = settings?.cta?.global_cta || settings?.global_cta;
          if (ctaData) {
            setConfig(ctaData);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // If explicitly disabled by administrator, do not render
  if (config && config.is_enabled === false) {
    return null;
  }

  // Resolve bilingual content with fallback
  const heading =
    config?.heading?.[locale] ||
    config?.heading?.en ||
    (locale === 'bn'
      ? 'সুপ্রিম কোর্ট চেম্বার পরামর্শ ও কৌশলগত আইনি সহায়তা'
      : 'Supreme Court Chamber Consultation & Strategic Advisory');

  const subheading =
    config?.subheading?.[locale] ||
    config?.subheading?.en ||
    (locale === 'bn'
      ? 'সাংবিধানিক রিট, সুপ্রিম কোর্ট আপিল ও কর্পোরেট আইনি বিষয়ে সরাসরি চেম্বার সম্মেলনের জন্য যোগাযোগ করুন।'
      : 'Direct conference with Advocate Nijam Uddin (Haq) for constitutional writs, appellate litigation, and corporate counsel.');

  const primaryLabel =
    config?.primary_button_label?.[locale] ||
    config?.primary_button_label?.en ||
    (locale === 'bn' ? 'পরামর্শ বুক করুন' : 'Book Consultation');

  const secondaryLabel =
    config?.secondary_button_label?.[locale] ||
    config?.secondary_button_label?.en ||
    (locale === 'bn' ? 'চেম্বার যোগাযোগ' : 'Contact Chamber');

  const primaryUrl = config?.primary_button_url || '/about#contact';
  const secondaryUrl = config?.secondary_button_url || '/contact';

  const handlePrimaryClick = () => {
    if (onConsultationClick) {
      onConsultationClick();
    } else if (primaryUrl.startsWith('#')) {
      const el = document.querySelector(primaryUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(primaryUrl);
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryUrl.startsWith('#')) {
      const el = document.querySelector(secondaryUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(secondaryUrl);
    }
  };

  return (
    <section
      id="global-cta"
      data-testid="global-cta"
      aria-label={locale === 'bn' ? 'পরামর্শ আহ্বান' : 'Call to Action'}
      className={`relative py-16 sm:py-20 bg-background-secondary border-t border-border-subtle/80 overflow-hidden ${className}`}
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="relative rounded-2xl bg-gradient-to-br from-surface-elevated via-surface-card to-background-primary border border-gold-border/60 p-8 sm:p-12 md:p-14 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading and Description */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-editorial font-bold text-text-primary leading-tight">
                {heading}
              </h2>

              <p className="text-sm sm:text-base text-text-muted leading-relaxed font-light max-w-2xl">
                {subheading}
              </p>
            </div>

            {/* Right Column: Actions */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-center lg:items-end">
              <Button
                variant="primary"
                size="md"
                onClick={handlePrimaryClick}
                leftIcon={<Calendar className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                className="w-full sm:w-auto lg:w-full justify-center shadow-lg group cursor-pointer"
              >
                {primaryLabel}
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleSecondaryClick}
                leftIcon={<Mail className="w-4 h-4 text-gold-primary" />}
                className="w-full sm:w-auto lg:w-full justify-center cursor-pointer"
              >
                {secondaryLabel}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
