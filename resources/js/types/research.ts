import { Localized, ContentStatus, VisibilityTier, ResearchType } from './index';


export interface ResearchFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  q?: string;
  category?: string | number;
  tag?: string;
  type?: string;
  research_type?: string;
  is_featured?: boolean;
  featured?: boolean;
}

export interface LegalResearchFormData {
  title: { en: string; bn?: string };
  slug: string;
  research_type: ResearchType;
  category_id?: number | null;
  tags?: number[];
  author: { en: string; bn?: string };
  excerpt: { en: string; bn?: string };
  content: { en: string; bn?: string };
  research_date?: string | null;
  featured_image_id?: number | null;
  pdf_media_id?: number | null;
  external_url?: string | null;
  visibility: VisibilityTier;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  seo?: {
    seo_title?: { en: string; bn?: string };
    meta_description?: { en: string; bn?: string };
    canonical_url?: string;
    og_title?: { en: string; bn?: string };
    og_description?: { en: string; bn?: string };
    og_image_id?: number | null;
  };
}

export interface TaxonomyCategory {
  id: number;
  name: string | Localized;
  slug: string;
  type: string;
}

export interface TaxonomyTag {
  id: number;
  name: string | Localized;
  slug: string;
}
