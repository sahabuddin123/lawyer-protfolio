import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { CaseCard } from '@/components/cards/CaseCard';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { CourtroomExperience } from '@/types/courtroom';
import type { HomepageSection } from '@/types/cms';

export interface CourtroomSectionProps {
  courtroom: CourtroomExperience[];
  sectionConfig?: HomepageSection;
}

export const CourtroomSection: React.FC<CourtroomSectionProps> = ({
  courtroom,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  if (!courtroom || courtroom.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.courtroomEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.courtroomTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.courtroomDescription;

  return (
    <HomeSectionWrapper
      id="courtroom"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllCourtroom}
      actionUrl="/courtroom"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courtroom.map((item) => {
          const caseTitle = resolveLocalized(item.title, locale);
          const legalArea = resolveLocalized(item.legal_area, locale) || item.case_type || 'Litigation';
          const summary = resolveLocalized(item.summary, locale);
          const imageUrl = item.featured_image?.variants?.medium || item.featured_image?.url;

          return (
            <CaseCard
              key={item.id}
              title={caseTitle}
              court={item.court}
              year={item.year}
              legalArea={legalArea}
              caseNumber={item.case_number || undefined}
              summary={summary}
              imageUrl={imageUrl}
              onReadCase={() => navigate(`/courtroom/${item.slug}`)}
            />
          );
        })}
      </div>
    </HomeSectionWrapper>
  );
};
