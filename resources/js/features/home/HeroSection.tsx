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

  const lawyerName = resolveLocalized(hero.name, locale) || t.identity.lawyerName || 'Advocate Nijam Uddin (Haq)';
  const configuredTitle = resolveLocalized(sectionConfig?.title, locale);
  const configuredSubtitle = resolveLocalized(sectionConfig?.subtitle, locale);

  const isTitleName = Boolean(configuredTitle && (configuredTitle.toLowerCase().includes('nijam') || configuredTitle.toLowerCase().includes('নিজাম')));
  const headingText = isTitleName ? configuredTitle : lawyerName;

  const subtitleText = !isTitleName && configuredTitle
    ? configuredTitle
    : (configuredSubtitle || (locale === 'bn' ? 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট — হাইকোর্ট বিভাগ' : 'Advocate, Supreme Court of Bangladesh — High Court Division'));

  const eyebrowText = (configuredSubtitle && configuredSubtitle !== subtitleText)
    ? configuredSubtitle
    : (locale === 'bn' ? 'বাংলাদেশ সুপ্রিম কোর্ট • হাইকোর্ট বিভাগ' : 'Supreme Court of Bangladesh • High Court Division');

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
    '/images/portrait-nijamuddin-600w.webp';

  // Badges from verified data
  const credentialsBadge =
    (sectionConfig?.settings as any)?.credentials_badge ||
    hero.bar_council_enrollment ||
    (locale === 'bn' ? 'বাংলাদেশ বার কাউন্সিল' : 'Bangladesh Bar Council');

  const experienceBadge =
    (sectionConfig?.settings as any)?.experience_badge ||
    hero.supreme_court_status ||
    (locale === 'bn' ? 'বাংলাদেশ সুপ্রিম কোর্ট' : 'Supreme Court of Bangladesh');

  const districtCourtBadge =
    (sectionConfig?.settings as any)?.district_court_badge ||
    hero.district_court_badge ||
    (locale === 'bn' ? 'নোয়াখালী জজ কোর্ট' : 'Noakhali Judge Court');

  return (
    <Hero
      eyebrow={eyebrowText}
      title={headingText}
      subtitle={subtitleText}
      description={description}
      primaryCtaText={primaryCtaText}
      onPrimaryCtaClick={handlePrimaryClick}
      secondaryCtaText={secondaryCtaText}
      onSecondaryCtaClick={handleSecondaryClick}
      portraitUrl={portraitUrl}
      portraitAlt={headingText}
      credentialsBadge={credentialsBadge}
      experienceBadge={experienceBadge}
      districtCourtBadge={districtCourtBadge}
    />
  );
};
