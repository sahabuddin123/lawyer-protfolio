import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { PracticeAreaCard } from '@/components/cards/PracticeAreaCard';
import { PracticeAreaIcon } from '@/components/icons/PracticeAreaIcon';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { PracticeArea } from '@/types/practiceArea';
import type { HomepageSection } from '@/types/cms';

export interface PracticeAreasSectionProps {
  practiceAreas: PracticeArea[];
  sectionConfig?: HomepageSection;
}

export const PracticeAreasSection: React.FC<PracticeAreasSectionProps> = ({
  practiceAreas,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  if (!practiceAreas || practiceAreas.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.practiceAreasEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.practiceAreasTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.practiceAreasDescription;

  return (
    <HomeSectionWrapper
      id="practice-areas"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllPracticeAreas}
      actionUrl="/practice-areas"
      className="bg-background-secondary"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {practiceAreas.map((area, index) => (
          <PracticeAreaCard
            key={area.id}
            number={index + 1}
            title={resolveLocalized(area.title, locale)}
            description={resolveLocalized(area.short_description, locale)}
            icon={<PracticeAreaIcon name={area.icon_name} className="w-5 h-5" />}
            onClick={() => navigate(`/practice-areas/${area.slug}`)}
          />
        ))}
      </div>
    </HomeSectionWrapper>
  );
};
