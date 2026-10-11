import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/hero/Hero';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { HomeHeroData } from '@/types/home';
import type { HomepageSection } from '@/types/cms';

export interface HeroSectionProps {
  hero: HomeHeroData;
  sectionConfig?: HomepageSection;
  onConsultationClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  hero,
  sectionConfig,
  onConsultationClick,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.heroEyebrow;
  const name = resolveLocalized(hero.name, locale) || t.identity.lawyerName;
  const professionalTitle =
    resolveLocalized(hero.professional_title || hero.title, locale) ||
    t.identity.designation;
  const headline = resolveLocalized(sectionConfig?.title, locale) || t.sections.heroHeadline;
  const description =
    resolveLocalized(hero.short_bio, locale) ||
    resolveLocalized(sectionConfig?.content, locale) ||
    t.sections.heroSummary;

  // Primary & Secondary CTAs
  const primaryCtaText =
    resolveLocalized(sectionConfig?.settings?.cta_label, locale) ||
    resolveLocalized(hero?.primary_cta_label, locale) ||
    t.sections.scheduleConsultation ||
    t.nav.bookConsultation;
  const secondaryCtaText =
    resolveLocalized(sectionConfig?.settings?.secondary_cta_label, locale) ||
    resolveLocalized(hero?.secondary_cta_label, locale) ||
    t.sections.explorePracticeAreas ||
    t.nav.practiceAreas;

  const handlePrimaryClick = () => {
    if (onConsultationClick) {
      onConsultationClick();
    } else {
      navigate(sectionConfig?.settings?.cta_url || '/contact');
    }
  };

  const handleSecondaryClick = () => {
    navigate(sectionConfig?.settings?.secondary_cta_url || '/practice-areas');
  };

  // Image source resolution
  const portraitUrl =
    sectionConfig?.settings?.image_url ||
    hero?.hero_image?.variants?.large ||
    hero?.hero_image?.url ||
    hero?.court_robes_photo?.variants?.large ||
    hero?.court_robes_photo?.url ||
    hero?.avatar?.variants?.large ||
    hero?.avatar?.url ||
    '/images/portrait-nijamuddin.jpg';

  // Badges from verified data
  const credentialsBadge =
    hero.supreme_court_status ||
    hero.bar_council_enrollment ||
    (locale === 'bn' ? 'বাংলাদেশ বার কাউন্সিল' : 'Bangladesh Bar Council');

  const experienceBadge =
    resolveLocalized(hero.designation, locale) ||
    (locale === 'bn' ? 'সুপ্রিম কোর্ট অব বাংলাদেশ' : 'Supreme Court of Bangladesh');

  return (
    <Hero
      eyebrow={eyebrow}
      title={
        <span>
          {name}
          <span className="block text-2xl sm:text-3xl md:text-4xl text-gold-primary font-normal mt-2">
            {headline}
          </span>
        </span>
      }
      subtitle={professionalTitle}
      description={description}
      primaryCtaText={primaryCtaText}
      onPrimaryCtaClick={handlePrimaryClick}
      secondaryCtaText={secondaryCtaText}
      onSecondaryCtaClick={handleSecondaryClick}
      portraitUrl={portraitUrl}
      portraitAlt={name}
      credentialsBadge={credentialsBadge}
      experienceBadge={experienceBadge}
    />
  );
};
