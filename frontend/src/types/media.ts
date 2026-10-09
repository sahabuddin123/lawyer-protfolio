import { ContentStatus, VisibilityTier, MediaPress, MediaAppearance, PressMediaType, ElectronicMediaType } from './index';
import { TaxonomyCategory, TaxonomyTag } from './research';

export interface MediaFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  q?: string;
  type?: string;
  media_type?: string;
  category?: string | number;
  category_id?: number;
  tag?: string;
  source?: string;
  channel?: string;
  year?: number | string;
  status?: ContentStatus | 'all';
  visibility?: VisibilityTier | 'all';
  is_featured?: boolean;
  featured?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface MediaPressFormData {
  title: { en: string; bn?: string };
  slug: string;
  media_type: string;
  media_name: { en: string; bn?: string };
  published_date?: string | null;
  article_url?: string | null;
  category_id?: number | null;
  tags?: number[];
  featured_image_id?: number | null;
  document_media_id?: number | null;
  description?: { en: string; bn?: string } | null;
  visibility: VisibilityTier;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  seo?: {
    seo_title?: { en: string; bn?: string };
    meta_description?: { en: string; bn?: string };
    canonical_url?: string;
    og_title?: { en: string; bn?: string };
    og_description?: { en: string; bn?: string };
    og_image_id?: number | null;
  };
}

export interface MediaAppearanceFormData {
  title: { en: string; bn?: string };
  slug: string;
  media_type: string;
  channel: { en: string; bn?: string };
  program: { en: string; bn?: string };
  broadcast_date?: string | null;
  video_url?: string | null;
  thumbnail_id?: number | null;
  document_media_id?: number | null;
  category_id?: number | null;
  tags?: number[];
  description?: { en: string; bn?: string } | null;
  visibility: VisibilityTier;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  seo?: {
    seo_title?: { en: string; bn?: string };
    meta_description?: { en: string; bn?: string };
    canonical_url?: string;
    og_title?: { en: string; bn?: string };
    og_description?: { en: string; bn?: string };
    og_image_id?: number | null;
  };
}

export interface UnifiedMediaOverview {
  featured_press: MediaPress[];
  featured_appearances: MediaAppearance[];
  latest_press: MediaPress[];
  latest_appearances: MediaAppearance[];
}

export type { MediaPress, MediaAppearance, PressMediaType, ElectronicMediaType, TaxonomyCategory, TaxonomyTag };
