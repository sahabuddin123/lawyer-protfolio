import { Localized, MediaAsset, SeoMeta } from './index';

export type ProfileStatus = 'draft' | 'published' | 'hidden';

export interface ProfileData {
  id: number;
  name: Localized;
  title: Localized;
  subtitle?: Localized;
  short_bio: Localized;
  long_bio: Localized;
  status: ProfileStatus;
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
  profile_photo?: MediaAsset;
  court_robes_photo?: MediaAsset;
  signature_photo?: MediaAsset;
  seo?: SeoMeta;
  credentials?: CredentialItem[];
  educations?: EducationItem[];
  timeline?: CareerTimelineItem[];
  memberships?: ProfessionalMembershipItem[];
}

export type CredentialCategory = 'academic' | 'professional' | 'court' | 'certification';

export interface CredentialItem {
  id: number;
  category: CredentialCategory;
  title: Localized;
  institution: Localized;
  description?: Localized;
  year?: string | null;
  credential_id?: string | null;
  certificate_media_id?: number | null;
  certificate?: MediaAsset;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface EducationItem {
  id: number;
  degree: Localized;
  institution: Localized;
  department?: Localized;
  description?: Localized;
  year_completed?: string | null;
  distinction?: Localized;
  is_active: boolean;
  sort_order: number;
}

export interface CareerTimelineItem {
  id: number;
  period: string;
  title: Localized;
  organization: Localized;
  description?: Localized;
  is_current: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface ProfessionalMembershipItem {
  id: number;
  organization: Localized;
  role: Localized;
  description?: Localized;
  membership_number?: string | null;
  year_joined?: string | null;
  is_active: boolean;
  sort_order: number;
}
