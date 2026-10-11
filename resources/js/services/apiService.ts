import { apiClient } from '@/api/client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';

/**
 * Universal Generic API Data Access Layer
 */
export const apiService = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const raw: any = await apiClient.get<ApiResponse<T>>(url, { params });
    return raw?.data?.success !== undefined ? raw.data : raw;
  },

  getPaginated: async <T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<ApiPaginatedResponse<T>> => {
    const raw: any = await apiClient.get<ApiPaginatedResponse<T>>(url, { params });
    return raw?.data?.success !== undefined ? raw.data : raw;
  },

  post: async <T, B = unknown>(url: string, body: B): Promise<ApiResponse<T>> => {
    const raw: any = await apiClient.post<ApiResponse<T>>(url, body);
    return raw?.data?.success !== undefined ? raw.data : raw;
  },
};
