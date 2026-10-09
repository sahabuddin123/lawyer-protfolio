# 10. TypeScript API Type Contracts

**Standard:** TypeScript 5.7+ Strict Mode  
**Zero `any` Policy:** Fully typed domain models matching Laravel API Resources  
**Lead Coordinator:** Senior Frontend Engineer & API Architect  

---

## 1. Core Primitives & API Response Envelopes

```typescript
/**
 * Bilingual attribute container representing localized values in English and Bengali.
 */
export type Localized<T = string> = {
  en: T;
  bn: T;
};

/**
 * Standard content publishing workflow statuses.
 */
export type ContentStatus = 'draft' | 'published' | 'archived';

/**
 * Courtroom experience & case study visibility tier.
 */
export type VisibilityTier = 'public' | 'private';

/**
 * Standard API Meta Block
 */
export interface ApiMeta {
  timestamp: string;
  locale: 'en' | 'bn';
}

/**
 * Standard Pagination Meta Block
 */
export interface PaginationMeta extends ApiMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

/**
 * Universal API Single Resource Envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

/**
 * Universal API Paginated List Envelope
 */
export interface ApiPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standardized API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error_code?: string;
}
```

---

## 2. Media & Asset Contracts

```typescript
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
```

---

## 3. SEO & Structured Data Contract

```typescript
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
```

---

## 4. Advocate Profile, Credentials & Pedigree

```typescript
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
```

---

## 5. Legal Practice & Courtroom Experience

```typescript
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
```

---

## 6. Research, Judgments & Publications

```typescript
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
  type: 'research' | 'publication' | 'courtroom' | 'gallery';
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
  category?: Category;
  tags?: Tag[];
  research_type: ResearchType;
  title: Localized;
  slug: string;
  author: Localized;
  excerpt: Localized;
  content: Localized;
  featured_image?: MediaAsset;
  pdf_media?: MediaAsset;
  view_count: number;
  status: ContentStatus;
  is_featured: boolean;
  published_at?: string;
  seo_meta?: SeoMeta;
}

export interface JudgmentReview {
  id: number;
  case_name: Localized;
  citation: string;
  slug: string;
  court: string;
  judgment_date: string;
  legal_area: Localized;
  summary: Localized;
  key_issues: Localized;
  court_decision: Localized;
  author_analysis: Localized;
  practical_significance?: Localized;
  featured_image?: MediaAsset;
  pdf_media?: MediaAsset;
  status: ContentStatus;
  is_featured: boolean;
  published_at?: string;
  seo_meta?: SeoMeta;
}

export type PublicationType = 
  | 'article' 
  | 'research_paper' 
  | 'case_note' 
  | 'law_review' 
  | 'legal_opinion' 
  | 'book' 
  | 'book_chapter';

export interface Publication {
  id: number;
  category_id?: number;
  category?: Category;
  tags?: Tag[];
  publication_type: PublicationType;
  title: Localized;
  slug: string;
  publication_name: Localized;
  publication_date: string;
  author: Localized;
  excerpt: Localized;
  content?: Localized;
  external_url?: string;
  cover_image?: MediaAsset;
  pdf_media?: MediaAsset;
  status: ContentStatus;
  is_featured: boolean;
  seo_meta?: SeoMeta;
}
```

---

## 7. Media Appearances, Videos & Gallery

```typescript
export interface MediaPress {
  id: number;
  media_name: Localized;
  title: Localized;
  slug: string;
  published_date: string;
  article_url?: string;
  featured_image?: MediaAsset;
  description: Localized;
  status: ContentStatus;
  is_featured: boolean;
}

export interface MediaAppearance {
  id: number;
  channel: Localized;
  program: Localized;
  title: Localized;
  slug: string;
  video_url: string;
  thumbnail?: MediaAsset;
  broadcast_date: string;
  description?: Localized;
  status: ContentStatus;
  is_featured: boolean;
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
```

---

## 8. Client Intake, Interaction & Consultation

```typescript
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

export interface ContactFormInput {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  _honeypot?: string;
}

export interface ConsultationFormInput {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  practice_area_id?: number;
  preferred_date?: string;
  message: string;
  _honeypot?: string;
}
```

---

## 9. CMS, Homepage Sections & Menus

```typescript
export type HomepageSectionKey = 
  | 'hero' 
  | 'credentials' 
  | 'about' 
  | 'practice_areas' 
  | 'courtroom' 
  | 'judgments' 
  | 'research' 
  | 'publications' 
  | 'videos' 
  | 'media' 
  | 'gallery' 
  | 'cta';

export interface HomepageSection {
  id: number;
  section_key: HomepageSectionKey;
  title: Localized;
  subtitle?: Localized;
  content?: Localized;
  settings: Record<string, unknown>;
  sort_order: number;
  is_enabled: boolean;
}

export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id?: number;
  title: Localized;
  url: string;
  target: '_self' | '_blank';
  sort_order: number;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  location: 'primary_header' | 'footer_quick_links' | 'footer_practice_areas';
  title: string;
  items: MenuItem[];
}

export interface Page {
  id: number;
  title: Localized;
  slug: string;
  content: Localized;
  status: ContentStatus;
  published_at?: string;
  seo_meta?: SeoMeta;
}
```

---

## 10. Identity, RBAC & Audit Trails

```typescript
export interface Role {
  id: number;
  name: 'super_admin' | 'admin' | 'editor' | 'content_manager' | 'media_manager';
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
  roles: string[];
  permissions: string[];
  last_login_at?: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  action: string;
  subject_type?: string;
  subject_id?: number;
  description: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
```
