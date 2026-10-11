import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { MediaCard } from '@/components/cards/MediaCard';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { MediaItem } from '@/types/home';
import type { HomepageSection } from '@/types/cms';

export interface MediaSectionProps {
  media: MediaItem[];
  sectionConfig?: HomepageSection;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  media,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  if (!media || media.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.mediaEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.mediaTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.mediaDescription;

  return (
    <HomeSectionWrapper
      id="media"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllMedia}
      actionUrl="/media"
      className="bg-background-secondary"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {media.map((item) => {
          const itemTitle = resolveLocalized(item.title, locale);
          const mediaName =
            resolveLocalized((item as any).media_name, locale) ||
            resolveLocalized((item as any).outlet, locale) ||
            'National Daily';
          const excerpt =
            resolveLocalized((item as any).description, locale) ||
            resolveLocalized((item as any).excerpt, locale) ||
            '';
          const dateStr = (item as any).published_date || (item as any).air_date || '';

          return (
            <MediaCard
              key={item.id}
              mediaName={mediaName}
              title={itemTitle}
              date={dateStr}
              description={excerpt}
              articleUrl={(item as any).article_url || (item as any).external_url || undefined}
              onReadMore={() => navigate(`/media/${item.slug}`)}
            />
          );
        })}
      </div>
    </HomeSectionWrapper>
  );
};
