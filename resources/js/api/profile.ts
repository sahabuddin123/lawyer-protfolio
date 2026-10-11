import { apiClient } from './client';
import { ApiResponse } from '@/types';
import {
  ProfileData,
  CredentialItem,
  EducationItem,
  CareerTimelineItem,
  ProfessionalMembershipItem,
} from '@/types/profile';

export const profileApi = {
  // Public Endpoints
  getProfile: async (): Promise<ApiResponse<ProfileData>> => {
    return apiClient.get('/profile');
  },

  getCredentials: async (): Promise<ApiResponse<{ credentials: CredentialItem[]; educations: EducationItem[] }>> => {
    return apiClient.get('/credentials');
  },

  getTimeline: async (): Promise<ApiResponse<{ timeline: CareerTimelineItem[]; memberships: ProfessionalMembershipItem[] }>> => {
    return apiClient.get('/timeline');
  },

  // Admin Profile Endpoints
  getAdminProfile: async (): Promise<ApiResponse<ProfileData>> => {
    return apiClient.get('/admin/profile');
  },

  updateAdminProfile: async (payload: Partial<ProfileData>): Promise<ApiResponse<ProfileData>> => {
    return apiClient.put('/admin/profile', payload);
  },

  // Admin Credentials
  getAdminCredentials: async (): Promise<ApiResponse<CredentialItem[]>> => {
    return apiClient.get('/admin/credentials');
  },

  createAdminCredential: async (payload: Partial<CredentialItem>): Promise<ApiResponse<CredentialItem>> => {
    return apiClient.post('/admin/credentials', payload);
  },

  updateAdminCredential: async (id: number, payload: Partial<CredentialItem>): Promise<ApiResponse<CredentialItem>> => {
    return apiClient.put(`/admin/credentials/${id}`, payload);
  },

  deleteAdminCredential: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/credentials/${id}`);
  },

  reorderAdminCredentials: async (items: number[]): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/credentials/reorder', { items });
  },

  // Admin Educations
  getAdminEducations: async (): Promise<ApiResponse<EducationItem[]>> => {
    return apiClient.get('/admin/educations');
  },

  createAdminEducation: async (payload: Partial<EducationItem>): Promise<ApiResponse<EducationItem>> => {
    return apiClient.post('/admin/educations', payload);
  },

  updateAdminEducation: async (id: number, payload: Partial<EducationItem>): Promise<ApiResponse<EducationItem>> => {
    return apiClient.put(`/admin/educations/${id}`, payload);
  },

  deleteAdminEducation: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/educations/${id}`);
  },

  reorderAdminEducations: async (items: number[]): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/educations/reorder', { items });
  },

  // Admin Career Timeline
  getAdminTimeline: async (): Promise<ApiResponse<CareerTimelineItem[]>> => {
    return apiClient.get('/admin/timeline');
  },

  createAdminTimeline: async (payload: Partial<CareerTimelineItem>): Promise<ApiResponse<CareerTimelineItem>> => {
    return apiClient.post('/admin/timeline', payload);
  },

  updateAdminTimeline: async (id: number, payload: Partial<CareerTimelineItem>): Promise<ApiResponse<CareerTimelineItem>> => {
    return apiClient.put(`/admin/timeline/${id}`, payload);
  },

  deleteAdminTimeline: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/timeline/${id}`);
  },

  reorderAdminTimeline: async (items: number[]): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/timeline/reorder', { items });
  },

  // Admin Professional Memberships
  getAdminMemberships: async (): Promise<ApiResponse<ProfessionalMembershipItem[]>> => {
    return apiClient.get('/admin/memberships');
  },

  createAdminMembership: async (payload: Partial<ProfessionalMembershipItem>): Promise<ApiResponse<ProfessionalMembershipItem>> => {
    return apiClient.post('/admin/memberships', payload);
  },

  updateAdminMembership: async (id: number, payload: Partial<ProfessionalMembershipItem>): Promise<ApiResponse<ProfessionalMembershipItem>> => {
    return apiClient.put(`/admin/memberships/${id}`, payload);
  },

  deleteAdminMembership: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/memberships/${id}`);
  },

  reorderAdminMemberships: async (items: number[]): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/memberships/reorder', { items });
  },
};
