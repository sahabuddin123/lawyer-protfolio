export type ElementType =
  | 'divider'
  | 'spacer'
  | 'container'
  | 'site_identity'
  | 'heading'
  | 'paragraph'
  | 'rich_text'
  | 'image'
  | 'icon'
  | 'button'
  | 'link'
  | 'navigation_menu'
  | 'custom_link_group'
  | 'social_group'
  | 'social_icon'
  | 'chambers_list'
  | 'chamber_card'
  | 'phone_contact'
  | 'email_contact'
  | 'contact_group'
  | 'legal_disclaimer'
  | 'copyright'
  | 'legal_links'
  | 'back_to_top'
  | 'custom_cta_reference';

export interface BilingualText {
  en?: string;
  bn?: string;
}

export interface FooterElementSettings {
  font_size?: string;
  font_weight?: string;
  letter_spacing?: string;
  text_transform?: string;
  color?: string;
  text_color?: string;
  background_color?: string;
  padding?: string;
  margin?: string;
  border_color?: string;
  alignment?: 'left' | 'center' | 'right';
  hide_desktop?: boolean;
  hide_tablet?: boolean;
  hide_mobile?: boolean;
  custom_css?: string;
  [key: string]: any;
}

export interface FooterElement {
  id: string;
  type: ElementType;
  content: {
    text?: BilingualText | string;
    title?: BilingualText | string;
    heading?: BilingualText | string;
    lawyer_name?: BilingualText;
    designation?: BilingualText;
    has_emblem?: boolean;
    url?: string;
    href?: string;
    target?: '_self' | '_blank';
    phone?: string;
    email?: string;
    whatsapp?: string;
    is_phone_placeholder?: boolean;
    with_emblem?: boolean;
    copyright_prefix?: BilingualText;
    items?: Array<{
      label: BilingualText | string;
      url: string;
      icon?: string;
      target?: '_self' | '_blank';
    }>;
    chambers?: Array<{
      id: string;
      name: BilingualText;
      address: BilingualText;
      map_url?: string;
    }>;
    profiles?: Array<{
      platform: string;
      label?: string;
      url: string;
      is_active?: boolean;
    }>;
    dynamic_source?: string;
    [key: string]: any;
  };
  settings: FooterElementSettings;
}

export interface FooterColumnSettings {
  space_y?: string;
  background_color?: string;
  padding?: string;
  alignment?: 'left' | 'center' | 'right';
  hide_desktop?: boolean;
  hide_tablet?: boolean;
  hide_mobile?: boolean;
  [key: string]: any;
}

export interface FooterColumn {
  id: string;
  span: number; // 1 to 12
  settings: FooterColumnSettings;
  elements: FooterElement[];
}

export interface FooterRowSettings {
  gap?: string;
  margin_bottom?: string;
  padding_top?: string;
  padding_bottom?: string;
  background_color?: string;
  has_divider?: boolean;
  space_y?: string;
  [key: string]: any;
}

export interface FooterRow {
  id: string;
  settings: FooterRowSettings;
  columns: FooterColumn[];
}

export interface FooterLayoutSettings {
  background_color?: string;
  text_color?: string;
  heading_color?: string;
  accent_color?: string;
  border_top_color?: string;
  padding_top?: string;
  padding_bottom?: string;
  max_width?: string;
  [key: string]: any;
}

export interface FooterLayoutData {
  settings: FooterLayoutSettings;
  rows: FooterRow[];
}

export interface FooterTemplate {
  id: number;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  is_active: boolean;
  display_conditions: {
    type?: string;
    pages?: string[];
    [key: string]: any;
  } | null;
  layout_data: FooterLayoutData;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  revisions_count?: number;
  creator?: { id: number; name: string; email: string } | null;
  updater?: { id: number; name: string; email: string } | null;
}

export interface FooterRevision {
  id: number;
  footer_template_id: number;
  version: number;
  layout_data: FooterLayoutData;
  change_summary?: string | null;
  created_by?: number | null;
  created_at: string;
  creator?: { id: number; name: string; email: string } | null;
}

export interface CanonicalData {
  identity: {
    lawyer_name: BilingualText;
    designation: BilingualText;
    qualifications: BilingualText;
    bar_council_status: BilingualText;
  };
  chambers: Array<{
    id: string;
    name: BilingualText;
    address: BilingualText;
    map_url?: string;
    is_primary: boolean;
  }>;
  contacts: {
    phone: string;
    email: string;
    whatsapp?: string;
    is_phone_placeholder?: boolean;
    is_email_placeholder?: boolean;
    verification_notice?: string | null;
  };
  social_profiles: Array<{
    platform: string;
    label: string;
    url: string;
    is_active: boolean;
  }>;
  menus: Array<{
    id: number;
    location: string;
    title: string;
    items?: Array<{ id: number; title: any; url: string }>;
  }>;
  pages: Array<{
    id: number;
    title: any;
    slug: string;
  }>;
  practice_areas: Array<{
    id: number;
    title: any;
    slug: string;
  }>;
}

export interface PublicFooterPayload {
  template_id?: number | null;
  slug: string;
  name: string;
  locale: string;
  layout: FooterLayoutData;
}
