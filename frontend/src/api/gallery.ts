import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';
import {
  GalleryAlbumItem,
  GalleryAlbumDetailItem,
  AdminGalleryAlbumItem,
  AdminGalleryImageItem,
  GalleryAlbumFormData,
  GalleryFilters,
} from '@/types/gallery';

export const galleryApi = {
  // Public Endpoints
  getGalleryList: async (
    params?: GalleryFilters
  ): Promise<ApiPaginatedResponse<GalleryAlbumItem>> => {
    return apiClient.get('/gallery', { params });
  },

  getAlbumBySlug: async (
    slug: string
  ): Promise<ApiResponse<GalleryAlbumDetailItem>> => {
    return apiClient.get(`/gallery/${slug}`);
  },

  // Admin Endpoints
  getAdminAlbumsList: async (
    params?: Record<string, any>
  ): Promise<ApiPaginatedResponse<AdminGalleryAlbumItem>> => {
    return apiClient.get('/admin/gallery', { params });
  },

  getAdminAlbum: async (
    id: number
  ): Promise<ApiResponse<AdminGalleryAlbumItem>> => {
    return apiClient.get(`/admin/gallery/${id}`);
  },

  createAlbum: async (
    payload: GalleryAlbumFormData
  ): Promise<ApiResponse<AdminGalleryAlbumItem>> => {
    return apiClient.post('/admin/gallery', payload);
  },

  updateAlbum: async (
    id: number,
    payload: GalleryAlbumFormData
  ): Promise<ApiResponse<AdminGalleryAlbumItem>> => {
    return apiClient.put(`/admin/gallery/${id}`, payload);
  },

  deleteAlbum: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/gallery/${id}`);
  },

  reorderAlbums: async (
    items: Array<{ id: number; sort_order: number }> | number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/gallery/reorder', { items });
  },

  previewAlbum: async (
    id: number
  ): Promise<ApiResponse<AdminGalleryAlbumItem>> => {
    return apiClient.get(`/admin/gallery/${id}/preview`);
  },

  // Image sub-resource operations
  attachImage: async (
    albumId: number,
    payload: {
      media_id: number;
      caption?: { en?: string; bn?: string };
      alt_text?: { en?: string; bn?: string };
      sort_order?: number;
      visibility?: 'public' | 'private';
      is_featured?: boolean;
    }
  ): Promise<ApiResponse<AdminGalleryImageItem>> => {
    return apiClient.post(`/admin/gallery/${albumId}/images`, payload);
  },

  uploadImage: async (
    albumId: number,
    formData: FormData
  ): Promise<ApiResponse<AdminGalleryImageItem>> => {
    return apiClient.post(`/admin/gallery/${albumId}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateImage: async (
    albumId: number,
    imageId: number,
    payload: {
      caption?: { en?: string; bn?: string };
      alt_text?: { en?: string; bn?: string };
      sort_order?: number;
      visibility?: 'public' | 'private';
      is_featured?: boolean;
    }
  ): Promise<ApiResponse<AdminGalleryImageItem>> => {
    return apiClient.put(`/admin/gallery/${albumId}/images/${imageId}`, payload);
  },

  detachImage: async (
    albumId: number,
    imageId: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/gallery/${albumId}/images/${imageId}`);
  },

  reorderImages: async (
    albumId: number,
    items: Array<{ id: number; sort_order: number }> | number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post(`/admin/gallery/${albumId}/images/reorder`, { items });
  },

  setCoverImage: async (
    albumId: number,
    imageId: number
  ): Promise<ApiResponse<AdminGalleryAlbumItem>> => {
    return apiClient.post(`/admin/gallery/${albumId}/images/${imageId}/set-cover`);
  },
};
