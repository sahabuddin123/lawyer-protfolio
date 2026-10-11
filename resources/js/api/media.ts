import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';
import {
  MediaPress,
  MediaAppearance,
  MediaFilterParams,
  MediaPressFormData,
  MediaAppearanceFormData,
  UnifiedMediaOverview,
  TaxonomyCategory,
  TaxonomyTag,
} from '@/types/media';

export const mediaApi = {
  // Unified Public Endpoints
  getUnifiedMedia: async (
    params?: MediaFilterParams
  ): Promise<ApiResponse<UnifiedMediaOverview>> => {
    return apiClient.get('/media', { params });
  },

  getMediaBySlug: async (
    slug: string
  ): Promise<ApiResponse<MediaPress | MediaAppearance>> => {
    return apiClient.get(`/media/${slug}`);
  },

  // Public Press Endpoints
  getPressList: async (
    params?: MediaFilterParams
  ): Promise<ApiPaginatedResponse<MediaPress>> => {
    return apiClient.get('/media/press', { params });
  },

  getPressBySlug: async (
    slug: string
  ): Promise<ApiResponse<MediaPress>> => {
    return apiClient.get(`/media/press/${slug}`);
  },

  getPressDownloadUrl: (slug: string): string => {
    return `/api/v1/media/press/${slug}/download`;
  },

  // Public Appearances Endpoints
  getAppearancesList: async (
    params?: MediaFilterParams
  ): Promise<ApiPaginatedResponse<MediaAppearance>> => {
    return apiClient.get('/media/appearances', { params });
  },

  getAppearanceBySlug: async (
    slug: string
  ): Promise<ApiResponse<MediaAppearance>> => {
    return apiClient.get(`/media/appearances/${slug}`);
  },

  getAppearanceDownloadUrl: (slug: string): string => {
    return `/api/v1/media/appearances/${slug}/download`;
  },

  // Admin Press Endpoints
  getAdminPressList: async (
    params?: MediaFilterParams
  ): Promise<ApiPaginatedResponse<MediaPress>> => {
    return apiClient.get('/admin/media/press', { params });
  },

  getAdminPress: async (
    id: number
  ): Promise<ApiResponse<MediaPress>> => {
    return apiClient.get(`/admin/media/press/${id}`);
  },

  createPress: async (
    payload: MediaPressFormData
  ): Promise<ApiResponse<MediaPress>> => {
    return apiClient.post('/admin/media/press', payload);
  },

  updatePress: async (
    id: number,
    payload: MediaPressFormData
  ): Promise<ApiResponse<MediaPress>> => {
    return apiClient.put(`/admin/media/press/${id}`, payload);
  },

  deletePress: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/media/press/${id}`);
  },

  reorderPress: async (
    items: number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/media/press/reorder', { items });
  },

  previewPress: async (
    id: number
  ): Promise<ApiResponse<MediaPress>> => {
    return apiClient.get(`/admin/media/press/${id}/preview`);
  },

  getAdminPressDownloadUrl: (id: number): string => {
    return `/api/v1/admin/media/press/${id}/download`;
  },

  // Admin Appearances Endpoints
  getAdminAppearancesList: async (
    params?: MediaFilterParams
  ): Promise<ApiPaginatedResponse<MediaAppearance>> => {
    return apiClient.get('/admin/media/appearances', { params });
  },

  getAdminAppearance: async (
    id: number
  ): Promise<ApiResponse<MediaAppearance>> => {
    return apiClient.get(`/admin/media/appearances/${id}`);
  },

  createAppearance: async (
    payload: MediaAppearanceFormData
  ): Promise<ApiResponse<MediaAppearance>> => {
    return apiClient.post('/admin/media/appearances', payload);
  },

  updateAppearance: async (
    id: number,
    payload: MediaAppearanceFormData
  ): Promise<ApiResponse<MediaAppearance>> => {
    return apiClient.put(`/admin/media/appearances/${id}`, payload);
  },

  deleteAppearance: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/media/appearances/${id}`);
  },

  reorderAppearances: async (
    items: number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/media/appearances/reorder', { items });
  },

  previewAppearance: async (
    id: number
  ): Promise<ApiResponse<MediaAppearance>> => {
    return apiClient.get(`/admin/media/appearances/${id}/preview`);
  },

  getAdminAppearanceDownloadUrl: (id: number): string => {
    return `/api/v1/admin/media/appearances/${id}/download`;
  },

  // Taxonomies
  getCategories: async (
    type = 'media'
  ): Promise<ApiResponse<TaxonomyCategory[]>> => {
    return apiClient.get('/categories', { params: { type } });
  },

  getTags: async (): Promise<ApiResponse<TaxonomyTag[]>> => {
    return apiClient.get('/tags');
  },
};
