import { Localized, MediaAsset, SeoMeta } from './index';
import { SeoMetaFormData } from './practiceArea';

export type CourtroomStatus = 'draft' | 'published' | 'archived';
export type CourtroomVisibility = 'public' | 'private';

export interface CaseDocument {
  id: number;
  courtroom_experience_id?: number;
  title: string | Localized;
  document_type?: string | null;
  media_id?: number;
  media?: MediaAsset | null;
  is_confidential?: boolean;
  sort_order?: number;
  download_count?: number;
  download_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CaseDocumentFormData {
  title: Localized;
  document_type?: string;
  media_id: number;
  is_confidential: boolean;
  sort_order: number;
}

export interface CourtroomExperience {
  id: number;
  slug: string;
  title: string | Localized;
  case_number?: string | null;
  court: string;
  case_type: string;
  year: number;
  practice_area_id?: number | null;
  practice_area?: {
    id: number;
    title: string | Localized;
    slug: string;
  } | null;
  legal_area: string | Localized;
  role: string | Localized;
  summary: string | Localized;
  description?: string | Localized;
  issues?: string | Localized | null;
  arguments?: string | Localized | null;
  outcome?: string | Localized | null;
  judgment_date?: string | null;
  featured_image_id?: number | null;
  featured_image?: MediaAsset | null;
  visibility?: CourtroomVisibility;
  status?: CourtroomStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  documents_count?: number;
  documents?: CaseDocument[];
  related_experiences?: CourtroomExperience[];
  seo?: SeoMeta | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourtroomExperienceFormData {
  title: Localized;
  slug: string;
  case_number?: string | null;
  court: string;
  case_type: string;
  year: number;
  practice_area_id?: number | null;
  legal_area: Localized;
  role: Localized;
  summary: Localized;
  description: Localized;
  issues?: Localized;
  arguments?: Localized;
  outcome?: Localized;
  judgment_date?: string | null;
  featured_image_id?: number | null;
  visibility: CourtroomVisibility;
  status: CourtroomStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  seo?: SeoMetaFormData | null;
}

export interface CourtroomFilterParams {
  q?: string;
  search?: string;
  court?: string;
  case_type?: string;
  year?: number | string;
  practice_area_id?: number | string;
  is_featured?: boolean;
  page?: number;
  per_page?: number;
}
