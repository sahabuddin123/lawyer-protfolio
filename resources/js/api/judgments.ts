import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse, JudgmentReview } from '@/types';
import { JudgmentFilterParams, JudgmentReviewFormData } from '@/types/judgment';
import { TaxonomyCategory, TaxonomyTag } from '@/types/research';

export const judgmentsApi = {
  // Public Endpoints
  getJudgments: async (
    params?: JudgmentFilterParams
  ): Promise<ApiPaginatedResponse<JudgmentReview>> => {
    return apiClient.get('/judgments', { params });
  },

  getJudgmentBySlug: async (
    slug: string
  ): Promise<ApiResponse<JudgmentReview>> => {
    return apiClient.get(`/judgments/${slug}`);
  },

  getDownloadUrl: (slug: string): string => {
    return `/api/v1/judgments/${slug}/download`;
  },

  // Admin Endpoints
  getAdminJudgments: async (
    params?: JudgmentFilterParams
  ): Promise<ApiPaginatedResponse<JudgmentReview>> => {
    return apiClient.get('/admin/judgments', { params });
  },

  getAdminJudgment: async (
    id: number
  ): Promise<ApiResponse<JudgmentReview>> => {
    return apiClient.get(`/admin/judgments/${id}`);
  },

  createJudgment: async (
    payload: JudgmentReviewFormData
  ): Promise<ApiResponse<JudgmentReview>> => {
    return apiClient.post('/admin/judgments', payload);
  },

  updateJudgment: async (
    id: number,
    payload: JudgmentReviewFormData
  ): Promise<ApiResponse<JudgmentReview>> => {
    return apiClient.put(`/admin/judgments/${id}`, payload);
  },

  deleteJudgment: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/judgments/${id}`);
  },

  reorderJudgments: async (
    items: number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/judgments/reorder', { items });
  },

  previewJudgment: async (
    id: number
  ): Promise<ApiResponse<JudgmentReview>> => {
    return apiClient.get(`/admin/judgments/${id}/preview`);
  },

  getAdminDownloadUrl: (id: number): string => {
    return `/api/v1/admin/judgments/${id}/download`;
  },

  // Taxonomies
  getCategories: async (
    type = 'judgments'
  ): Promise<ApiResponse<TaxonomyCategory[]>> => {
    return apiClient.get('/categories', { params: { type } });
  },

  getTags: async (): Promise<ApiResponse<TaxonomyTag[]>> => {
    return apiClient.get('/tags');
  },
};
