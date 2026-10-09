import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { GalleryCard } from '@/components/cards/GalleryCard';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { GalleryAlbumItem } from '@/types/gallery';
import type { HomepageSection } from '@/types/cms';

export interface GallerySectionProps {
  gallery: GalleryAlbumItem[];
  sectionConfig?: HomepageSection;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallery,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  if (!gallery || gallery.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.galleryEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.galleryTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.galleryDescription;

  return (
    <HomeSectionWrapper
      id="gallery"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllGallery}
      actionUrl="/gallery"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {gallery.map((album) => {
          const albumTitle = resolveLocalized(album.title, locale);
          const coverUrl =
            album.cover_image?.variants?.medium ||
            album.cover_image?.url ||
            album.cover_image_url ||
            '/images/gallery-placeholder.jpg';
          const dateStr = album.event_date || (album.published_at ? new Date(album.published_at).toLocaleDateString() : '');

          return (
            <GalleryCard
              key={album.id}
              coverUrl={coverUrl}
              title={albumTitle}
              photoCount={album.image_count || 0}
              date={dateStr}
              onClick={() => navigate(`/gallery/${album.slug}`)}
            />
          );
        })}
      </div>
    </HomeSectionWrapper>
  );
};
