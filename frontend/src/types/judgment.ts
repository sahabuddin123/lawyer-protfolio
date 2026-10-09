import { ContentStatus, VisibilityTier, JudgmentReview } from './index';

export interface JudgmentFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  q?: string;
  court?: string;
  legal_area?: string;
  practice_area?: string | number;
  practice_area_id?: number;
  category?: string | number;
  category_id?: number;
  tag?: string;
  year?: number | string;
  status?: ContentStatus | 'all';
  visibility?: VisibilityTier | 'all';
  is_featured?: boolean;
  featured?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface JudgmentReviewFormData {
  case_name: { en: string; bn?: string };
  citation: string;
  slug: string;
  court: string;
  judgment_date?: string | null;
  legal_area?: { en: string; bn?: string };
  summary: { en: string; bn?: string };
  key_issues?: { en: string; bn?: string };
  court_decision: { en: string; bn?: string };
  author_analysis: { en: string; bn?: string };
  practical_significance?: { en: string; bn?: string };
  practice_area_id?: number | null;
  category_id?: number | null;
  legal_research_id?: number | null;
  author?: { en: string; bn?: string };
  featured_image_id?: number | null;
  pdf_media_id?: number | null;
  visibility: VisibilityTier;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  tags?: number[];
  seo?: {
    seo_title?: { en: string; bn?: string };
    meta_description?: { en: string; bn?: string };
    canonical_url?: string;
    og_title?: { en: string; bn?: string };
    og_description?: { en: string; bn?: string };
    og_image_id?: number | null;
  };
}

export type { JudgmentReview };
