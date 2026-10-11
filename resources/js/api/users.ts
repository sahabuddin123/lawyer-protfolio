import { apiClient } from './client';
import type { ApiResponse, ApiPaginatedResponse, User, Role, RoleName } from '@/types';

// Helper to reliably extract the inner data payload
const unwrapData = <T>(res: any): T => {
  if (res && typeof res === 'object') {
    if (res.data !== undefined && typeof res.data === 'object' && res.data !== null && 'data' in res.data) {
      return res.data.data as T;
    }
    if ('data' in res) {
      return res.data as T;
    }
  }
  return res as T;
};

// Helper for paginated responses
const unwrapPaginated = <T>(res: any): ApiPaginatedResponse<T> => {
  if (res && typeof res === 'object') {
    if (res.data !== undefined && typeof res.data === 'object' && res.data !== null && 'data' in res.data && 'meta' in res.data) {
      return res.data as ApiPaginatedResponse<T>;
    }
    if ('data' in res && 'meta' in res) {
      return res as ApiPaginatedResponse<T>;
    }
    if (Array.isArray(res.data)) {
      return { success: true, message: '', data: res.data, meta: res.meta ?? ({} as any) };
    }
    if (Array.isArray(res)) {
      return { success: true, message: '', data: res, meta: {} as any };
    }
  }
  return { success: true, message: '', data: [], meta: {} as any };
};

export const usersApi = {
  /**
   * Fetch paginated list of administrators with search and filtering
   */
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    q?: string;
    role?: string;
    status?: string | boolean;
  }): Promise<ApiPaginatedResponse<User>> => {
    const response = await apiClient.get<ApiPaginatedResponse<User>>('/admin/users', { params });
    return unwrapPaginated<User>(response);
  },

  /**
   * Fetch single administrator by ID
   */
  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    return unwrapData<User>(response);
  },

  /**
   * Update roles assigned to an administrator
   */
  updateUserRoles: async (id: number, roles: RoleName[]): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/roles`, { roles });
    return unwrapData<User>(response);
  },

  /**
   * Update active status for an administrator
   */
  updateUserStatus: async (id: number, isActive: boolean): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { is_active: isActive });
    return unwrapData<User>(response);
  },

  /**
   * Fetch all system roles and their assigned permissions
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/admin/roles');
    return unwrapData<Role[]>(response);
  },
};
