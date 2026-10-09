import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';
import {
  PracticeArea,
  PracticeAreaFormData,
  PracticeAreaFilterParams,
} from '@/types/practiceArea';

export const practiceAreaApi = {
  // Public Endpoints
  getPracticeAreas: async (
    params?: PracticeAreaFilterParams
  ): Promise<ApiPaginatedResponse<PracticeArea>> => {
    return apiClient.get('/practice-areas', { params });
  },

  getPracticeAreaBySlug: async (
    slug: string
  ): Promise<ApiResponse<PracticeArea>> => {
    return apiClient.get(`/practice-areas/${slug}`);
  },

  // Admin Endpoints
  getAdminPracticeAreas: async (params?: {
    search?: string;
    q?: string;
    status?: string;
    is_featured?: boolean;
    sort_by?: string;
    sort_dir?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiPaginatedResponse<PracticeArea>> => {
    return apiClient.get('/admin/practice-areas', { params });
  },

  getAdminPracticeArea: async (
    id: number
  ): Promise<ApiResponse<PracticeArea>> => {
    return apiClient.get(`/admin/practice-areas/${id}`);
  },

  createPracticeArea: async (
    payload: PracticeAreaFormData
  ): Promise<ApiResponse<PracticeArea>> => {
    return apiClient.post('/admin/practice-areas', payload);
  },

  updatePracticeArea: async (
    id: number,
    payload: PracticeAreaFormData
  ): Promise<ApiResponse<PracticeArea>> => {
    return apiClient.put(`/admin/practice-areas/${id}`, payload);
  },

  deletePracticeArea: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/practice-areas/${id}`);
  },

  reorderPracticeAreas: async (
    items: number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/practice-areas/reorder', { items });
  },
};
