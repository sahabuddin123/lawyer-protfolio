import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse, LegalResearch } from '@/types';
import {
  ResearchFilterParams,
  LegalResearchFormData,
  TaxonomyCategory,
  TaxonomyTag,
} from '@/types/research';

export const researchApi = {
  // Public Endpoints
  getResearches: async (
    params?: ResearchFilterParams
  ): Promise<ApiPaginatedResponse<LegalResearch>> => {
    return apiClient.get('/research', { params });
  },

  getResearchBySlug: async (
    slug: string
  ): Promise<ApiResponse<LegalResearch>> => {
    return apiClient.get(`/research/${slug}`);
  },

  getPublicCategories: async (
    type = 'research'
  ): Promise<ApiResponse<TaxonomyCategory[]>> => {
    return apiClient.get('/categories', { params: { type } });
  },

  getPublicTags: async (): Promise<ApiResponse<TaxonomyTag[]>> => {
    return apiClient.get('/tags');
  },

  getDownloadUrl: (slug: string): string => {
    return `/api/v1/research/${slug}/download`;
  },

  // Admin Endpoints
  getAdminResearches: async (params?: {
    search?: string;
    q?: string;
    status?: string;
    visibility?: string;
    research_type?: string;
    type?: string;
    category_id?: number | string;
    tag?: string;
    author?: string;
    is_featured?: boolean;
    sort_by?: string;
    sort_dir?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiPaginatedResponse<LegalResearch>> => {
    return apiClient.get('/admin/research', { params });
  },

  getAdminResearch: async (
    id: number
  ): Promise<ApiResponse<LegalResearch>> => {
    return apiClient.get(`/admin/research/${id}`);
  },

  createResearch: async (
    payload: LegalResearchFormData
  ): Promise<ApiResponse<LegalResearch>> => {
    return apiClient.post('/admin/research', payload);
  },

  updateResearch: async (
    id: number,
    payload: LegalResearchFormData
  ): Promise<ApiResponse<LegalResearch>> => {
    return apiClient.put(`/admin/research/${id}`, payload);
  },

  deleteResearch: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/research/${id}`);
  },

  reorderResearches: async (
    items: number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/research/reorder', { items });
  },

  previewResearch: async (
    id: number
  ): Promise<ApiResponse<LegalResearch>> => {
    return apiClient.get(`/admin/research/${id}/preview`);
  },

  // Taxonomies Admin Endpoints
  getAdminCategories: async (
    type = 'research'
  ): Promise<ApiResponse<TaxonomyCategory[]>> => {
    return apiClient.get('/admin/taxonomies/categories', { params: { type } });
  },

  createCategory: async (payload: {
    name: { en: string; bn?: string };
    slug?: string;
    type: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<ApiResponse<TaxonomyCategory>> => {
    return apiClient.post('/admin/taxonomies/categories', payload);
  },

  getAdminTags: async (): Promise<ApiResponse<TaxonomyTag[]>> => {
    return apiClient.get('/admin/taxonomies/tags');
  },

  createTag: async (payload: {
    name: { en: string; bn?: string };
    slug?: string;
  }): Promise<ApiResponse<TaxonomyTag>> => {
    return apiClient.post('/admin/taxonomies/tags', payload);
  },
};
