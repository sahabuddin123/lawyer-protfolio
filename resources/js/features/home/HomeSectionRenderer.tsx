import React from 'react';
import { HeroSection } from './HeroSection';
import { CredentialsSection } from './CredentialsSection';
import { AboutPreviewSection } from './AboutPreviewSection';
import { PracticeAreasSection } from './PracticeAreasSection';
import { CourtroomSection } from './CourtroomSection';
import { JudgmentReviewsSection } from './JudgmentReviewsSection';
import { ResearchSection } from './ResearchSection';
import { PublicationsSection } from './PublicationsSection';
import { VideosSection } from './VideosSection';
import { MediaSection } from './MediaSection';
import { GallerySection } from './GallerySection';
import type { PublicHomepageData } from '@/types/home';
import type { HomepageSection } from '@/types/cms';

export interface HomeSectionRendererProps {
  data: PublicHomepageData;
  onConsultationClick?: () => void;
}

export const HomeSectionRenderer: React.FC<HomeSectionRendererProps> = ({
  data,
  onConsultationClick,
}) => {
  // Resilient fallback: If database sections are unseeded, render core verified sections
  const sections = data.sections && data.sections.length > 0 ? data.sections : [
    { id: 1, section_key: 'hero', title: { en: 'Advocate Nijam Uddin (Haq)', bn: 'এডভোকেট নিজাম উদ্দিন (হক)' }, sort_order: 1, is_enabled: true } as HomepageSection,
    { id: 2, section_key: 'about_preview', title: { en: 'About Chambers', bn: 'চেম্বার পরিচিতি' }, sort_order: 2, is_enabled: true } as HomepageSection,
    { id: 3, section_key: 'credentials', title: { en: 'Credentials', bn: 'সনদ ও মর্যাদা' }, sort_order: 3, is_enabled: true } as HomepageSection,
    { id: 4, section_key: 'practice_areas', title: { en: 'Practice Areas', bn: 'আইনি ক্ষেত্র' }, sort_order: 4, is_enabled: true } as HomepageSection,
  ];

  // Map section components by registered section_key
  const renderSectionByKey = (section: HomepageSection) => {
    if (!section.is_enabled) {
      return null;
    }

    switch (section.section_key) {
      case 'hero':
        return (
          <HeroSection
            key={section.section_key}
            hero={data.hero}
            sectionConfig={section}
            onConsultationClick={onConsultationClick}
          />
        );

      case 'credentials':
        if (!data.credentials || data.credentials.length === 0) {
          return null; // Empty domain section hidden per Requirement 30
        }
        return (
          <CredentialsSection
            key={section.section_key}
            credentials={data.credentials}
            sectionConfig={section}
          />
        );

      case 'about':
      case 'about_preview':
        return (
          <AboutPreviewSection
            key={section.section_key}
            about={data.about}
            sectionConfig={section}
          />
        );

      case 'practice_areas':
        const practiceItems = data.featured_practice_areas || data.practice_areas || [];
        if (practiceItems.length === 0) {
          return null;
        }
        return (
          <PracticeAreasSection
            key={section.section_key}
            practiceAreas={practiceItems}
            sectionConfig={section}
          />
        );

      case 'courtroom':
        const courtroomItems = data.featured_courtroom || data.courtroom || [];
        if (courtroomItems.length === 0) {
          return null;
        }
        return (
          <CourtroomSection
            key={section.section_key}
            courtroom={courtroomItems}
            sectionConfig={section}
          />
        );

      case 'judgments':
      case 'judgment_reviews':
        const judgmentItems = data.featured_judgments || data.judgment_reviews || [];
        if (judgmentItems.length === 0) {
          return null;
        }
        return (
          <JudgmentReviewsSection
            key={section.section_key}
            judgmentReviews={judgmentItems}
            sectionConfig={section}
          />
        );

      case 'research':
      case 'legal_research':
        const researchItems = data.featured_research || data.research || [];
        if (researchItems.length === 0) {
          return null;
        }
        return (
          <ResearchSection
            key={section.section_key}
            research={researchItems}
            sectionConfig={section}
          />
        );

      case 'publications':
        const publicationItems = data.featured_publications || data.publications || [];
        if (publicationItems.length === 0) {
          return null;
        }
        return (
          <PublicationsSection
            key={section.section_key}
            publications={publicationItems}
            sectionConfig={section}
          />
        );

      case 'videos':
        const videoItems = data.featured_videos || data.videos || [];
        if (videoItems.length === 0) {
          return null;
        }
        return (
          <VideosSection
            key={section.section_key}
            videos={videoItems}
            sectionConfig={section}
          />
        );

      case 'media':
        const mediaItems = data.featured_media || data.media || [];
        if (mediaItems.length === 0) {
          return null;
        }
        return (
          <MediaSection
            key={section.section_key}
            media={mediaItems}
            sectionConfig={section}
          />
        );

      case 'gallery':
        const galleryItems = data.featured_gallery || data.gallery || [];
        if (galleryItems.length === 0) {
          return null;
        }
        return (
          <GallerySection
            key={section.section_key}
            gallery={galleryItems}
            sectionConfig={section}
          />
        );

      case 'consultation_cta':
      case 'contact':
        // Suppressed to prevent duplicate CTA: Global CTA in RootLayout is rendered immediately above footer
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full">
      {sections.map((section) => renderSectionByKey(section))}
    </div>
  );
};
