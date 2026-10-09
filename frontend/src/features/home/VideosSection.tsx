import React, { useState } from 'react';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { VideoCard } from '@/components/cards/VideoCard';
import { VideoModal } from '@/components/modals/VideoModal';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { VideoItem } from '@/types/video';
import type { HomepageSection } from '@/types/cms';

export interface VideosSectionProps {
  videos: VideoItem[];
  sectionConfig?: HomepageSection;
}

export const VideosSection: React.FC<VideosSectionProps> = ({
  videos,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.videosEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.videosTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.videosDescription;

  return (
    <HomeSectionWrapper
      id="videos"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllVideos}
      actionUrl="/videos"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((item) => {
          const itemTitle = resolveLocalized(item.title, locale);
          const categoryName = item.category?.name
            ? resolveLocalized(item.category.name, locale)
            : 'Judicial Discourse';
          const thumbnailUrl =
            item.thumbnail?.variants?.medium ||
            item.thumbnail?.url ||
            (item.video_id ? `https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg` : '');
          const dateStr = item.published_date || item.date || '';

          return (
            <VideoCard
              key={item.id}
              thumbnailUrl={thumbnailUrl}
              title={itemTitle}
              category={categoryName}
              duration={item.duration || undefined}
              date={dateStr}
              onPlay={() => setActiveVideo(item)}
            />
          );
        })}
      </div>

      {/* Accessible Click-to-Play Modal (Zero Heavy Autoplay Embeds) */}
      {activeVideo && (
        <VideoModal
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          videoUrl={activeVideo.embed_url || activeVideo.video_url}
          title={resolveLocalized(activeVideo.title, locale)}
        />
      )}
    </HomeSectionWrapper>
  );
};
