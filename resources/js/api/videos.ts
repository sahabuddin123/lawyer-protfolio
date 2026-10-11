import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';
import {
  VideoItem,
  VideoDetailItem,
  AdminVideoItem,
  VideoFormData,
  VideoFilterParams,
  VideoCategory,
  VideoTag,
} from '@/types/video';

export const videosApi = {
  // Public Endpoints
  getVideosList: async (
    params?: VideoFilterParams
  ): Promise<ApiPaginatedResponse<VideoItem>> => {
    return apiClient.get('/videos', { params });
  },

  getVideoBySlug: async (
    slug: string
  ): Promise<ApiResponse<VideoDetailItem>> => {
    return apiClient.get(`/videos/${slug}`);
  },

  // Admin Endpoints
  getAdminVideosList: async (
    params?: VideoFilterParams
  ): Promise<ApiPaginatedResponse<AdminVideoItem>> => {
    return apiClient.get('/admin/videos', { params });
  },

  getAdminVideo: async (
    id: number
  ): Promise<ApiResponse<AdminVideoItem>> => {
    return apiClient.get(`/admin/videos/${id}`);
  },

  createVideo: async (
    payload: VideoFormData
  ): Promise<ApiResponse<AdminVideoItem>> => {
    return apiClient.post('/admin/videos', payload);
  },

  updateVideo: async (
    id: number,
    payload: VideoFormData
  ): Promise<ApiResponse<AdminVideoItem>> => {
    return apiClient.put(`/admin/videos/${id}`, payload);
  },

  deleteVideo: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/videos/${id}`);
  },

  reorderVideos: async (
    order: Array<{ id: number; sort_order: number }> | number[]
  ): Promise<ApiResponse<null>> => {
    return apiClient.post('/admin/videos/reorder', { order });
  },

  previewVideo: async (
    id: number
  ): Promise<ApiResponse<VideoDetailItem>> => {
    return apiClient.get(`/admin/videos/${id}/preview`);
  },

  // Taxonomy Helpers
  getCategories: async (): Promise<ApiResponse<VideoCategory[]>> => {
    return apiClient.get('/categories');
  },

  getTags: async (): Promise<ApiResponse<VideoTag[]>> => {
    return apiClient.get('/tags');
  },
};
