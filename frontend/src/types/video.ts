export type VideoPlatform = 'youtube' | 'vimeo' | 'external';

export type VideoStatus = 'draft' | 'published' | 'archived';
export type VideoVisibility = 'public' | 'private';

export interface VideoCategory {
  id: number;
  name: string;
  slug: string;
  type?: string;
}

export interface VideoTag {
  id: number;
  name: string;
  slug: string;
}

export interface VideoThumbnail {
  id: number;
  url: string;
  alt_text?: string;
  variants?: Record<string, string>;
}

export interface VideoItem {
  id: number;
  slug: string;
  title: string;
  platform: VideoPlatform;
  video_url: string;
  video_id?: string | null;
  embed_url?: string | null;
  external_watch_url: string;
  duration?: string | null;
  description?: string | null;
  published_date?: string | null;
  date?: string | null;
  category?: VideoCategory | null;
  tags?: VideoTag[];
  thumbnail?: VideoThumbnail | null;
  is_featured: boolean;
  featured: boolean;
}

export interface VideoDetailItem extends VideoItem {
  structured_data?: Record<string, any>;
  related_videos?: VideoItem[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
  };
}

export interface AdminVideoItem {
  id: number;
  slug: string;
  title: { en: string; bn: string };
  platform: VideoPlatform;
  video_url: string;
  video_id?: string | null;
  embed_url?: string | null;
  thumbnail_id?: number | null;
  thumbnail?: VideoThumbnail | null;
  category_id?: number | null;
  category?: VideoCategory | null;
  tags?: VideoTag[];
  duration?: string | null;
  description?: { en: string; bn: string } | null;
  published_date?: string | null;
  status: VideoStatus;
  visibility: VideoVisibility;
  is_featured: boolean;
  featured: boolean;
  sort_order: number;
  published_at?: string | null;
  seo?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

export interface VideoFormData {
  title: { en: string; bn: string };
  slug?: string;
  platform: VideoPlatform;
  video_url: string;
  video_id?: string;
  thumbnail_id?: number | null;
  category_id?: number | null;
  duration?: string;
  description?: { en: string; bn: string };
  published_date?: string;
  status: VideoStatus;
  visibility: VideoVisibility;
  is_featured: boolean;
  sort_order?: number;
  tags?: number[];
  seo?: {
    seo_title?: { en: string; bn: string };
    meta_description?: { en: string; bn: string };
    canonical_url?: string;
  };
}

export interface VideoFilterParams {
  search?: string;
  platform?: string;
  category?: string;
  category_id?: number | string;
  tag?: string;
  status?: string;
  visibility?: string;
  featured?: boolean;
  is_featured?: boolean;
  year?: number | string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}
