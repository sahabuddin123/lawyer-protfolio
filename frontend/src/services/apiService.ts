import { apiClient } from '@/api/client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';

/**
 * Universal Generic API Data Access Layer
 */
export const apiService = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const res = await apiClient.get<ApiResponse<T>>(url, { params });
    return res.data;
  },

  getPaginated: async <T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<ApiPaginatedResponse<T>> => {
    const res = await apiClient.get<ApiPaginatedResponse<T>>(url, { params });
    return res.data;
  },

  post: async <T, B = unknown>(url: string, body: B): Promise<ApiResponse<T>> => {
    const res = await apiClient.post<ApiResponse<T>>(url, body);
    return res.data;
  },
};
