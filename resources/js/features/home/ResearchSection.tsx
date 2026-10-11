import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { ResearchCard } from '@/components/cards/ResearchCard';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { LegalResearch } from '@/types';
import type { HomepageSection } from '@/types/cms';

export interface ResearchSectionProps {
  research: LegalResearch[];
  sectionConfig?: HomepageSection;
}

export const ResearchSection: React.FC<ResearchSectionProps> = ({
  research,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  if (!research || research.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.researchEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.researchTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.researchDescription;

  return (
    <HomeSectionWrapper
      id="research"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllResearch}
      actionUrl="/research"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {research.map((item) => {
          const itemTitle = resolveLocalized(item.title, locale);
          const excerpt = resolveLocalized(item.excerpt, locale);
          const author = resolveLocalized(item.author, locale);
          const categoryName = item.category?.name
            ? resolveLocalized(item.category.name, locale)
            : item.research_type || 'Monograph';
          const dateStr = item.published_at ? new Date(item.published_at).toLocaleDateString() : '';
          const readTimeStr = (item as any).read_time ? `${(item as any).read_time} min read` : undefined;

          return (
            <ResearchCard
              key={item.id}
              category={categoryName}
              title={itemTitle}
              excerpt={excerpt}
              date={dateStr}
              readTime={readTimeStr}
              author={author}
              onReadArticle={() => navigate(`/research/${item.slug}`)}
            />
          );
        })}
      </div>
    </HomeSectionWrapper>
  );
};
