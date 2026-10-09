/**
 * Core Domain & API Type Contracts
 * Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform
 */

export type Locale = 'en' | 'bn';

export type Localized<T = string> = {
  en: T;
  bn: T;
};

export type ContentStatus = 'draft' | 'published' | 'archived';
export type VisibilityTier = 'public' | 'private';

export interface ApiMeta {
  timestamp: string;
  locale: Locale;
}

export interface PaginationMeta extends ApiMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error_code?: string;
}

/* Media & Assets */
export interface MediaVariants {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  hero: string;
}

export interface MediaAsset {
  id: number;
  uuid: string;
  disk: string;
  directory: string;
  filename: string;
  original_name: string;
  mime_type: string;
  extension: string;
  size_bytes: number;
  width?: number;
  height?: number;
  alt_text?: Localized;
  caption?: Localized;
  variants?: MediaVariants;
  url: string;
  created_at: string;
}

/* SEO */
export interface SeoMeta {
  id: number;
  seotable_type: string;
  seotable_id: number;
  seo_title?: Localized;
  meta_description?: Localized;
  canonical_url?: string;
  og_title?: Localized;
  og_description?: Localized;
  og_image?: MediaAsset;
  robots: string;
  schema_type?: 'Person' | 'LegalService' | 'Article' | 'BreadcrumbList' | 'WebSite';
  structured_data?: Record<string, unknown>;
}

/* Advocate Profile & Credentials */
export interface Profile {
  id: number;
  name: Localized;
  title: Localized;
  short_bio: Localized;
  long_bio: Localized;
  profile_photo?: MediaAsset;
  court_robes_photo?: MediaAsset;
  bar_council_enrollment?: string;
  high_court_enrollment?: string;
  appellate_division_enrollment?: string;
  chambers_address: Localized;
  office_address: Localized;
  phone: string;
  email: string;
  whatsapp?: string;
  philosophy?: Localized;
  legal_approach?: Localized;
}

export type CredentialCategory = 'academic' | 'professional' | 'court' | 'certification';

export interface Credential {
  id: number;
  category: CredentialCategory;
  title: Localized;
  institution: Localized;
  year?: string;
  credential_id?: string;
  certificate_media?: MediaAsset;
  is_featured: boolean;
  sort_order: number;
}

export interface Education {
  id: number;
  degree: Localized;
  institution: Localized;
  department?: Localized;
  year_completed: string;
  distinction?: Localized;
  sort_order: number;
}

export interface CareerTimeline {
  id: number;
  period: string;
  title: Localized;
  organization: Localized;
  description?: Localized;
  sort_order: number;
}

export interface ProfessionalMembership {
  id: number;
  organization: Localized;
  role: Localized;
  membership_number?: string;
  year_joined?: string;
  is_active: boolean;
  sort_order: number;
}

/* Practice & Courtroom */
export interface PracticeArea {
  id: number;
  title: Localized;
  slug: string;
  short_description: Localized;
  full_description: Localized;
  icon_name?: string;
  featured_image?: MediaAsset;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string;
  seo_meta?: SeoMeta;
}

export interface CaseDocument {
  id: number;
  courtroom_experience_id: number;
  title: Localized;
  media: MediaAsset;
  is_confidential: boolean;
  sort_order: number;
  download_count: number;
}

export interface CourtroomExperience {
  id: number;
  title: Localized;
  slug: string;
  case_number?: string;
  court: string;
  case_type: string;
  year: number;
  legal_area: Localized;
  role: Localized;
  summary: Localized;
  description: Localized;
  issues?: Localized;
  arguments?: Localized;
  outcome?: Localized;
  judgment_date?: string;
  featured_image?: MediaAsset;
  visibility: VisibilityTier;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  published_at?: string;
  documents?: CaseDocument[];
  seo_meta?: SeoMeta;
}

/* Research, Judgments & Publications */
export type ResearchType = 
  | 'article' 
  | 'case_analysis' 
  | 'research_paper' 
  | 'constitutional_analysis' 
  | 'statutory_analysis' 
  | 'legal_opinion' 
  | 'commentary';

export interface Category {
  id: number;
  parent_id?: number;
  type: 'research' | 'publication' | 'courtroom' | 'gallery' | 'media' | 'press' | 'appearances';
  name: Localized;
  slug: string;
  description?: Localized;
  sort_order: number;
  is_active: boolean;
}

export interface Tag {
  id: number;
  name: Localized;
  slug: string;
}

export interface LegalResearch {
  id: number;
  category_id?: number;
  category?: {
    id: number;
    name: Localized | string;
    slug: string;
    type?: string;
  };
  tags?: Array<{
    id: number;
    name: Localized | string;
    slug: string;
  }>;
  research_type: ResearchType;
  title: Localized | string;
  slug: string;
  author: Localized | string;
  excerpt: Localized | string;
  content: Localized | string;
  research_date?: string;
  featured_image_id?: number;
  featured_image?: MediaAsset;
  pdf_media_id?: number;
  pdf_media?: MediaAsset | {
    id: number;
    original_name?: string;
    size_bytes?: number;
    mime_type?: string;
    download_url?: string;
  };
  has_pdf?: boolean;
  pdf_download_url?: string;
  external_url?: string;
  view_count: number;
  status: ContentStatus;
  visibility: VisibilityTier;
  is_featured: boolean;
  sort_order: number;
  read_time_minutes?: number;
  published_at?: string;
  related_research?: LegalResearch[];
  seo_meta?: SeoMeta;
  seo?: SeoMeta;
  created_at?: string;
  updated_at?: string;
}

export interface JudgmentReview {
  id: number;
  case_name: Localized | string;
  citation: string;
  slug: string;
  court: string;
  judgment_date?: string;
  legal_area?: Localized | string;
  summary: Localized | string;
  key_issues?: Localized | string;
  court_decision: Localized | string;
  author_analysis: Localized | string;
  practical_significance?: Localized | string;
  practice_area_id?: number;
  practice_area?: {
    id: number;
    title: Localized | string;
    slug: string;
  };
  category_id?: number;
  category?: {
    id: number;
    name: Localized | string;
    slug: string;
    type?: string;
  };
  legal_research_id?: number;
  legal_research?: {
    id: number;
    title: Localized | string;
    slug: string;
    excerpt?: Localized | string;
  };
  tags?: Array<{
    id: number;
    name: Localized | string;
    slug: string;
  }>;
  author?: Localized | string;
  featured_image_id?: number;
  featured_image?: MediaAsset;
  pdf_media_id?: number;
  pdf_media?: MediaAsset | {
    id: number;
    original_name?: string;
    size_bytes?: number;
    mime_type?: string;
    download_url?: string;
  };
  has_pdf?: boolean;
  pdf_download_url?: string;
  status: ContentStatus;
  visibility: VisibilityTier;
  is_featured: boolean;
  sort_order: number;
  published_at?: string;
  related_judgments?: JudgmentReview[];
  seo_meta?: SeoMeta;
  seo?: SeoMeta;
  created_at?: string;
  updated_at?: string;
}

export type PublicationType = 
  | 'article' 
  | 'research_paper' 
  | 'case_note' 
  | 'law_review' 
  | 'legal_opinion' 
  | 'book' 
  | 'book_chapter'
  | 'journal_article'
  | 'conference_paper'
  | 'legal_article'
  | 'report'
  | 'other';

export interface Publication {
  id: number;
  category_id?: number | null;
  category?: Category | {
    id: number;
    name: Localized | string;
    slug: string;
    type?: string;
  };
  tags?: Array<Tag | {
    id: number;
    name: Localized | string;
    slug: string;
  }>;
  publication_type: PublicationType | string;
  title: Localized | string;
  slug: string;
  publication_name?: Localized | string | null;
  publication_date?: string | null;
  author?: Localized | string | null;
  excerpt?: Localized | string | null;
  content?: Localized | string | null;
  external_url?: string | null;
  cover_image_id?: number | null;
  cover_image?: MediaAsset | {
    id: number;
    url: string;
    alt_text?: string | Localized;
  };
  pdf_media_id?: number | null;
  pdf_media?: MediaAsset | {
    id: number;
    original_name?: string;
    size_bytes?: number;
    mime_type?: string;
    download_url?: string;
  };
  has_pdf?: boolean;
  pdf_url?: string | null;
  status: ContentStatus;
  visibility: VisibilityTier;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  related_publications?: Publication[];
  seo_meta?: SeoMeta;
  seo?: SeoMeta;
  created_at?: string;
  updated_at?: string;
}

/* Media, Videos & Gallery */
export type PressMediaType =
  | 'newspaper'
  | 'magazine'
  | 'online_news'
  | 'press_release'
  | 'editorial'
  | 'other';

export type ElectronicMediaType =
  | 'tv'
  | 'radio'
  | 'talk_show'
  | 'roundtable'
  | 'interview'
  | 'digital_broadcast'
  | 'other';

export interface MediaPress {
  id: number;
  category_id?: number | null;
  category?: Category | {
    id: number;
    name: Localized | string;
    slug: string;
    type?: string;
  };
  tags?: Array<Tag | {
    id: number;
    name: Localized | string;
    slug: string;
  }>;
  media_type: PressMediaType | string;
  media_name: Localized | string;
  source?: string;
  title: Localized | string;
  slug: string;
  published_date?: string | null;
  date?: string | null;
  article_url?: string | null;
  external_url?: string | null;
  featured_image_id?: number | null;
  featured_image?: MediaAsset | {
    id: number;
    url: string;
    alt_text?: string | Localized;
  };
  thumbnail?: MediaAsset | {
    id: number;
    url: string;
    alt_text?: string | Localized;
  };
  document_media_id?: number | null;
  document_media?: MediaAsset | {
    id: number;
    original_name?: string;
    size_bytes?: number;
    mime_type?: string;
    download_url?: string;
  };
  has_document?: boolean;
  document_url?: string | null;
  description?: Localized | string | null;
  status: ContentStatus;
  visibility: VisibilityTier;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  related_items?: any[];
  seo_meta?: SeoMeta;
  seo?: SeoMeta;
  created_at?: string;
  updated_at?: string;
}

export interface MediaAppearance {
  id: number;
  category_id?: number | null;
  category?: Category | {
    id: number;
    name: Localized | string;
    slug: string;
    type?: string;
  };
  tags?: Array<Tag | {
    id: number;
    name: Localized | string;
    slug: string;
  }>;
  media_type: ElectronicMediaType | string;
  channel: Localized | string;
  source?: string;
  program: Localized | string;
  title: Localized | string;
  slug: string;
  video_url?: string | null;
  external_url?: string | null;
  thumbnail_id?: number | null;
  thumbnail?: MediaAsset | {
    id: number;
    url: string;
    alt_text?: string | Localized;
  };
  document_media_id?: number | null;
  document_media?: MediaAsset | {
    id: number;
    original_name?: string;
    size_bytes?: number;
    mime_type?: string;
    download_url?: string;
  };
  has_document?: boolean;
  document_url?: string | null;
  broadcast_date?: string | null;
  date?: string | null;
  description?: Localized | string | null;
  status: ContentStatus;
  visibility: VisibilityTier;
  is_featured: boolean;
  sort_order: number;
  published_at?: string | null;
  related_items?: any[];
  seo_meta?: SeoMeta;
  seo?: SeoMeta;
  created_at?: string;
  updated_at?: string;
}

export interface VideoItem {
  id: number;
  title: Localized;
  slug: string;
  platform: 'youtube' | 'vimeo' | 'external';
  video_url: string;
  video_id: string;
  thumbnail?: MediaAsset;
  duration?: string;
  description?: Localized;
  published_date: string;
  status: ContentStatus;
  is_featured: boolean;
}

export interface GalleryAlbum {
  id: number;
  title: Localized;
  slug: string;
  description?: Localized;
  cover_image?: MediaAsset;
  category_id?: number;
  category?: Category;
  event_date?: string;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  images_count?: number;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: number;
  album_id: number;
  media: MediaAsset;
  caption?: Localized;
  alt_text?: Localized;
  sort_order: number;
  is_featured: boolean;
}

/* Contacts & Consultations */
export type ContactStatus = 'new' | 'read' | 'replied' | 'archived' | 'spam';

export interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  admin_notes?: string;
  created_at: string;
}

export type ConsultationStatus = 
  | 'new' 
  | 'contacted' 
  | 'in_progress' 
  | 'scheduled' 
  | 'completed' 
  | 'closed' 
  | 'spam';

export interface ConsultationRequest {
  id: number;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  practice_area_id?: number;
  practice_area?: PracticeArea;
  preferred_date?: string;
  message: string;
  status: ConsultationStatus;
  admin_notes?: string;
  created_at: string;
}

/* Identity & RBAC Contracts */
export type RoleName = 'super_admin' | 'admin' | 'editor' | 'content_manager' | 'media_manager';

export interface Role {
  id: number;
  name: RoleName;
  guard_name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  module: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: MediaAsset;
  is_active: boolean;
  roles: RoleName[];
  permissions: string[];
  last_login_at?: string;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export * from './cms';
export * from './video';
export * from './gallery';
export * from './contact';
export * from './home';
