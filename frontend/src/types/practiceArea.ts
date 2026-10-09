import { Localized, MediaAsset, SeoMeta } from './index';

export type PracticeAreaStatus = 'draft' | 'published' | 'archived';

export interface SeoMetaFormData {
  seo_title?: Localized;
  meta_description?: Localized;
  canonical_url?: string;
  og_title?: Localized;
  og_description?: Localized;
  og_image_id?: number | null;
  robots?: string;
  schema_type?: string;
  structured_data?: Record<string, any>;
}

export interface PracticeArea {
  id: number;
  slug: string;
  title: string | Localized;
  short_description: string | Localized;
  full_description?: string | Localized;
  icon_name: string | null;
  featured_image_id?: number | null;
  featured_image?: MediaAsset | null;
  status?: PracticeAreaStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  seo?: SeoMeta | null;
  created_at?: string;
  updated_at?: string;
}

export interface PracticeAreaFormData {
  title: Localized;
  slug: string;
  short_description: Localized;
  full_description: Localized;
  icon_name: string | null;
  featured_image_id?: number | null;
  status: PracticeAreaStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  seo?: SeoMetaFormData | null;
}

export interface PracticeAreaFilterParams {
  search?: string;
  q?: string;
  featured?: boolean;
  is_featured?: boolean;
  page?: number;
  per_page?: number;
}
