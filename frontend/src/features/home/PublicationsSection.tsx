import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { PublicationCard } from '@/components/cards/PublicationCard';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { Publication } from '@/types/publication';
import type { HomepageSection } from '@/types/cms';

export interface PublicationsSectionProps {
  publications: Publication[];
  sectionConfig?: HomepageSection;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  publications,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  if (!publications || publications.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.publicationsEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.publicationsTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.publicationsDescription;

  return (
    <HomeSectionWrapper
      id="publications"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllPublications}
      actionUrl="/publications"
      className="bg-background-secondary"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {publications.map((item) => {
          const itemTitle = resolveLocalized(item.title, locale);
          const author = resolveLocalized(item.author, locale) || t.identity.lawyerName;
          const publicationName = resolveLocalized(item.publication_name, locale);
          const coverUrl = (item.cover_image as any)?.variants?.medium || (item.cover_image as any)?.url;
          const dateStr = item.publication_date || '';

          return (
            <PublicationCard
              key={item.id}
              coverUrl={coverUrl}
              title={itemTitle}
              publicationType={item.publication_type || 'Treatise'}
              publicationName={publicationName}
              date={dateStr}
              author={author}
              onReadMore={() => navigate(`/publications/${item.slug}`)}
            />
          );
        })}
      </div>
    </HomeSectionWrapper>
  );
};
