import type { Localized, ContentStatus } from './index';

/* CMS & Site Settings Contracts */
export interface SeoMeta {
  id?: number;
  seo_title?: Localized | string;
  meta_description?: Localized | string;
  canonical_url?: string;
  og_title?: Localized | string;
  og_description?: Localized | string;
  og_image_id?: number;
  og_image_url?: string;
  robots?: string;
  schema_type?: string;
  structured_data?: Record<string, unknown>;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: any;
  raw_value?: any;
  group: string;
  is_public: boolean;
  updated_at?: string;
}

export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id?: number | null;
  title: Localized | string;
  url: string;
  target: '_self' | '_blank';
  sort_order: number;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  location: string;
  title: string;
  items?: MenuItem[];
}

export interface Page {
  id: number;
  slug: string;
  title: Localized | string;
  content: Localized | string;
  status: ContentStatus;
  published_at?: string | null;
  seo?: SeoMeta;
  created_at: string;
  updated_at: string;
}

export interface HomepageSection {
  id: number;
  section_key: string;
  title: Localized | string;
  subtitle?: Localized | string;
  content?: Localized | string;
  settings?: Record<string, any>;
  sort_order: number;
  is_enabled: boolean;
}

export interface Redirect {
  id: number;
  source_url: string;
  target_url: string;
  status_code: number;
  is_active: boolean;
  hit_count: number;
  created_at: string;
  updated_at: string;
}
