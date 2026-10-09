import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';
import {
  CourtroomExperience,
  CourtroomExperienceFormData,
  CourtroomFilterParams,
  CaseDocument,
  CaseDocumentFormData,
} from '@/types/courtroom';

export const courtroomApi = {
  // Public Endpoints
  getCourtroomExperiences: async (
    params?: CourtroomFilterParams
  ): Promise<ApiPaginatedResponse<CourtroomExperience>> => {
    return apiClient.get('/courtroom', { params });
  },

  getCourtroomExperienceBySlug: async (
    slug: string
  ): Promise<ApiResponse<CourtroomExperience>> => {
    return apiClient.get(`/courtroom/${slug}`);
  },

  // Admin Endpoints
  getAdminCourtroomExperiences: async (params?: {
    search?: string;
    q?: string;
    status?: string;
    visibility?: string;
    court?: string;
    case_type?: string;
    year?: number | string;
    practice_area_id?: number | string;
    is_featured?: boolean;
    sort_by?: string;
    sort_dir?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiPaginatedResponse<CourtroomExperience>> => {
    return apiClient.get('/admin/courtroom', { params });
  },

  getAdminCourtroomExperience: async (
    id: number
  ): Promise<ApiResponse<CourtroomExperience>> => {
    return apiClient.get(`/admin/courtroom/${id}`);
  },

  createCourtroomExperience: async (
    payload: CourtroomExperienceFormData
  ): Promise<ApiResponse<CourtroomExperience>> => {
    return apiClient.post('/admin/courtroom', payload);
  },

  updateCourtroomExperience: async (
    id: number,
    payload: CourtroomExperienceFormData
  ): Promise<ApiResponse<CourtroomExperience>> => {
    return apiClient.put(`/admin/courtroom/${id}`, payload);
  },

  deleteCourtroomExperience: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/courtroom/${id}`);
  },

  reorderCourtroomExperiences: async (
    items: number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/courtroom/reorder', { items });
  },

  // Case Document Endpoints
  addCaseDocument: async (
    courtroomId: number,
    payload: CaseDocumentFormData
  ): Promise<ApiResponse<CaseDocument>> => {
    return apiClient.post(`/admin/courtroom/${courtroomId}/documents`, payload);
  },

  updateCaseDocument: async (
    documentId: number,
    payload: CaseDocumentFormData
  ): Promise<ApiResponse<CaseDocument>> => {
    return apiClient.put(`/admin/case-documents/${documentId}`, payload);
  },

  deleteCaseDocument: async (
    documentId: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/case-documents/${documentId}`);
  },
};
