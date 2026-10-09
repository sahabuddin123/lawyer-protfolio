import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse, Publication } from '@/types';
import { PublicationFilterParams, PublicationFormData, TaxonomyCategory, TaxonomyTag } from '@/types/publication';

export const publicationsApi = {
  // Public Endpoints
  getPublications: async (
    params?: PublicationFilterParams
  ): Promise<ApiPaginatedResponse<Publication>> => {
    return apiClient.get('/publications', { params });
  },

  getPublicationBySlug: async (
    slug: string
  ): Promise<ApiResponse<Publication>> => {
    return apiClient.get(`/publications/${slug}`);
  },

  getDownloadUrl: (slug: string): string => {
    return `/api/v1/publications/${slug}/download`;
  },

  // Admin Endpoints
  getAdminPublications: async (
    params?: PublicationFilterParams
  ): Promise<ApiPaginatedResponse<Publication>> => {
    return apiClient.get('/admin/publications', { params });
  },

  getAdminPublication: async (
    id: number
  ): Promise<ApiResponse<Publication>> => {
    return apiClient.get(`/admin/publications/${id}`);
  },

  createPublication: async (
    payload: PublicationFormData
  ): Promise<ApiResponse<Publication>> => {
    return apiClient.post('/admin/publications', payload);
  },

  updatePublication: async (
    id: number,
    payload: PublicationFormData
  ): Promise<ApiResponse<Publication>> => {
    return apiClient.put(`/admin/publications/${id}`, payload);
  },

  deletePublication: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/publications/${id}`);
  },

  reorderPublications: async (
    items: number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/publications/reorder', { items });
  },

  previewPublication: async (
    id: number
  ): Promise<ApiResponse<Publication>> => {
    return apiClient.get(`/admin/publications/${id}/preview`);
  },

  getAdminDownloadUrl: (id: number): string => {
    return `/api/v1/admin/publications/${id}/download`;
  },

  // Taxonomies
  getCategories: async (
    type = 'publications'
  ): Promise<ApiResponse<TaxonomyCategory[]>> => {
    return apiClient.get('/categories', { params: { type } });
  },

  getTags: async (): Promise<ApiResponse<TaxonomyTag[]>> => {
    return apiClient.get('/tags');
  },
};
