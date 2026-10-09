import type { Localized, MediaAsset, LegalResearch, MediaPress, MediaAppearance } from './index';
import type { HomepageSection, SeoMeta } from './cms';
import type { CredentialItem } from './profile';
import type { PracticeArea } from './practiceArea';
import type { CourtroomExperience } from './courtroom';
import type { JudgmentReview } from './judgment';
import type { Publication } from './publication';
import type { VideoItem } from './video';
import type { GalleryAlbumItem } from './gallery';

export type MediaItem = MediaPress | MediaAppearance | (Record<string, any> & { id: number; title: Localized | string; slug: string });

export interface HomeHeroData {
  id?: number;
  name: Localized | string;
  professional_title?: Localized | string;
  title?: Localized | string;
  designation?: Localized | string;
  short_bio?: Localized | string;
  avatar?: MediaAsset | null;
  hero_image?: MediaAsset | null;
  court_robes_photo?: MediaAsset | null;
  bar_council_enrollment?: string;
  high_court_enrollment?: string;
  appellate_division_enrollment?: string;
  supreme_court_status?: string;
  verified_credentials?: CredentialItem[];
  primary_cta_label?: Localized | string;
  primary_cta_url?: string;
  secondary_cta_label?: Localized | string;
  secondary_cta_url?: string;
}

export interface HomeAboutPreviewData {
  id?: number;
  name: Localized | string;
  professional_title?: Localized | string;
  title?: Localized | string;
  short_bio?: Localized | string;
  full_bio_preview?: Localized | string;
  long_bio?: Localized | string;
  avatar?: MediaAsset | null;
  court_robes_photo?: MediaAsset | null;
  philosophy?: Localized | string;
  stats?: Record<string, any>;
  cta_label?: Localized | string;
  cta_url?: string;
}

export interface HomeConsultationCtaData {
  title?: Localized | string;
  description?: Localized | string;
  phone?: string;
  email?: string;
  chamber_address?: Localized | string;
  office_hours?: Localized | string;
  button_label?: Localized | string;
  button_url?: string;
}

export interface PublicHomepageData {
  settings: Record<string, any>;
  sections: HomepageSection[];
  hero: HomeHeroData;
  credentials: CredentialItem[];
  about: HomeAboutPreviewData;
  practice_areas: PracticeArea[];
  featured_practice_areas: PracticeArea[];
  courtroom: CourtroomExperience[];
  featured_courtroom: CourtroomExperience[];
  judgment_reviews: JudgmentReview[];
  featured_judgments: JudgmentReview[];
  research: LegalResearch[];
  featured_research: LegalResearch[];
  publications: Publication[];
  featured_publications: Publication[];
  videos: VideoItem[];
  featured_videos: VideoItem[];
  media: MediaItem[];
  featured_media: MediaItem[];
  gallery: GalleryAlbumItem[];
  featured_gallery: GalleryAlbumItem[];
  consultation_cta: HomeConsultationCtaData;
  seo?: SeoMeta;
  structured_data?: Record<string, any>;
}
