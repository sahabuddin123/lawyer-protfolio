import { ContentStatus, VisibilityTier, Publication, PublicationType } from './index';
import { TaxonomyCategory, TaxonomyTag } from './research';

export interface PublicationFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  q?: string;
  type?: string;
  publication_type?: string;
  category?: string | number;
  category_id?: number;
  tag?: string;
  author?: string;
  year?: number | string;
  status?: ContentStatus | 'all';
  visibility?: VisibilityTier | 'all';
  is_featured?: boolean;
  featured?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface PublicationFormData {
  title: { en: string; bn?: string };
  slug: string;
  publication_type: string;
  publication_name?: { en: string; bn?: string } | null;
  author?: { en: string; bn?: string } | null;
  publication_date?: string | null;
  excerpt?: { en: string; bn?: string } | null;
  content?: { en: string; bn?: string } | null;
  category_id?: number | null;
  tags?: number[];
  cover_image_id?: number | null;
  pdf_media_id?: number | null;
  external_url?: string | null;
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

export type { Publication, PublicationType, TaxonomyCategory, TaxonomyTag };
