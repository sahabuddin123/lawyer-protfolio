export type AlbumStatus = 'draft' | 'published' | 'archived';
export type AlbumVisibility = 'public' | 'private';

export interface GalleryImageItem {
  id: number;
  url: string;
  variants?: Record<string, string>;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
  alt_text?: string | null;
  sort_order: number;
  is_featured: boolean;
}

export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
}

export interface GalleryAlbumItem {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  cover_image?: {
    url: string;
    variants?: Record<string, string>;
    width?: number | null;
    height?: number | null;
  } | null;
  category?: GalleryCategory | null;
  event_date?: string | null;
  is_featured: boolean;
  sort_order: number;
  image_count: number;
  published_at?: string | null;
}

export interface GalleryAlbumDetailItem extends GalleryAlbumItem {
  images: GalleryImageItem[];
  related_albums?: GalleryAlbumItem[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
  };
}

export interface AdminGalleryImageItem {
  id: number;
  album_id: number;
  media_id: number;
  url: string;
  variants?: Record<string, string>;
  width?: number | null;
  height?: number | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  caption?: { en?: string; bn?: string } | null;
  alt_text?: { en?: string; bn?: string } | null;
  sort_order: number;
  is_featured: boolean;
  featured: boolean;
  visibility: AlbumVisibility;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminGalleryAlbumItem {
  id: number;
  slug: string;
  title: { en: string; bn?: string };
  description?: { en?: string; bn?: string } | null;
  cover_image_id?: number | null;
  cover_image_url?: string | null;
  cover_image?: any;
  category_id?: number | null;
  category?: any;
  event_date?: string | null;
  published_at?: string | null;
  status: AlbumStatus;
  visibility: AlbumVisibility;
  is_featured: boolean;
  featured: boolean;
  sort_order: number;
  image_count: number;
  public_image_count: number;
  images?: AdminGalleryImageItem[];
  seo?: any;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryAlbumFormData {
  title: { en: string; bn?: string };
  slug: string;
  description: { en?: string; bn?: string };
  category_id?: number | null;
  cover_image_id?: number | null;
  event_date?: string;
  status: AlbumStatus;
  visibility: AlbumVisibility;
  is_featured: boolean;
  sort_order: number;
  seo?: {
    meta_title?: { en?: string; bn?: string };
    meta_description?: { en?: string; bn?: string };
    canonical_url?: string;
  };
}

export interface GalleryFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
}
