import { apiClient } from './client';
import type { ApiResponse, ApiPaginatedResponse, SiteSetting, Menu, MenuItem, Page, HomepageSection, Redirect, PublicHomepageData } from '@/types';

// Helper to reliably extract the inner data payload from an ApiResponse
const unwrapData = <T>(res: any): T => {
  if (res && typeof res === 'object') {
    // If it's an AxiosResponse wrapper: { data: { success: true, data: T } }
    if (res.data !== undefined && typeof res.data === 'object' && res.data !== null && 'data' in res.data) {
      return res.data.data as T;
    }
    // If it's already an ApiResponse { success: true, data: T }
    if ('data' in res) {
      return res.data as T;
    }
  }
  return res as T;
};

// Helper for paginated endpoints that must return ApiPaginatedResponse<T>
const unwrapPaginated = <T>(res: any): ApiPaginatedResponse<T> => {
  if (res && typeof res === 'object') {
    // If it's an AxiosResponse: { data: { success: true, data: T[], meta: ... } }
    if (res.data !== undefined && typeof res.data === 'object' && res.data !== null && 'data' in res.data && 'meta' in res.data) {
      return res.data as ApiPaginatedResponse<T>;
    }
    // If it's already an ApiPaginatedResponse { success: true, data: T[], meta: ... }
    if ('data' in res && 'meta' in res) {
      return res as ApiPaginatedResponse<T>;
    }
    // If it's a raw array
    if (Array.isArray(res)) {
      return { success: true, message: '', data: res, meta: {} as any };
    }
    // If it's an object with data array
    if (Array.isArray(res.data)) {
      return { success: true, message: '', data: res.data, meta: res.meta ?? ({} as any) };
    }
  }
  return { success: true, message: '', data: [], meta: {} as any };
};

export const cmsApi = {
  // Public APIs
  getPublicSettings: async (group?: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>('/settings', {
      params: group ? { group } : undefined,
    });
    return unwrapData<Record<string, any>>(response);
  },

  getPublicNavigation: async (): Promise<Record<string, Menu>> => {
    const response = await apiClient.get<ApiResponse<Record<string, Menu>>>('/navigation');
    return unwrapData<Record<string, Menu>>(response);
  },

  getPublicPage: async (slug: string): Promise<Page> => {
    const response = await apiClient.get<ApiResponse<Page>>(`/pages/${slug}`);
    return unwrapData<Page>(response);
  },

  getPublicHome: async (): Promise<PublicHomepageData> => {
    const response = await apiClient.get<ApiResponse<PublicHomepageData>>('/home');
    return unwrapData<PublicHomepageData>(response);
  },

  // Admin Settings APIs
  getAdminSettings: async (group?: string): Promise<SiteSetting[]> => {
    const response = await apiClient.get<ApiResponse<SiteSetting[]>>('/admin/settings', {
      params: group ? { group } : undefined,
    });
    return unwrapData<SiteSetting[]>(response);
  },

  updateAdminSettings: async (settings: { key: string; value: any; group?: string; is_public?: boolean }[]): Promise<SiteSetting[]> => {
    const response = await apiClient.put<ApiResponse<SiteSetting[]>>('/admin/settings', { settings });
    return unwrapData<SiteSetting[]>(response);
  },

  // Admin Pages APIs
  getAdminPages: async (params?: { page?: number; per_page?: number; status?: string; q?: string }): Promise<ApiPaginatedResponse<Page>> => {
    const response = await apiClient.get<ApiPaginatedResponse<Page>>('/admin/pages', { params });
    return unwrapPaginated<Page>(response);
  },

  getAdminPage: async (id: number): Promise<Page> => {
    const response = await apiClient.get<ApiResponse<Page>>(`/admin/pages/${id}`);
    return unwrapData<Page>(response);
  },

  createAdminPage: async (data: Partial<Page>): Promise<Page> => {
    const response = await apiClient.post<ApiResponse<Page>>('/admin/pages', data);
    return unwrapData<Page>(response);
  },

  updateAdminPage: async (id: number, data: Partial<Page>): Promise<Page> => {
    const response = await apiClient.put<ApiResponse<Page>>(`/admin/pages/${id}`, data);
    return unwrapData<Page>(response);
  },

  previewAdminPage: async (id: number): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/pages/${id}/preview`);
    return unwrapData<any>(response);
  },

  deleteAdminPage: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/pages/${id}`);
  },

  // Admin Navigation Menus
  getAdminMenus: async (): Promise<Menu[]> => {
    const response = await apiClient.get<ApiResponse<Menu[]>>('/admin/menus');
    return unwrapData<Menu[]>(response);
  },

  createAdminMenu: async (data: { location: string; title: string }): Promise<Menu> => {
    const response = await apiClient.post<ApiResponse<Menu>>('/admin/menus', data);
    return unwrapData<Menu>(response);
  },

  updateAdminMenu: async (id: number, data: { location: string; title: string }): Promise<Menu> => {
    const response = await apiClient.put<ApiResponse<Menu>>(`/admin/menus/${id}`, data);
    return unwrapData<Menu>(response);
  },

  deleteAdminMenu: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/menus/${id}`);
  },

  reorderAdminMenuItems: async (menuId: number, items: { id: number; sort_order: number; parent_id?: number | null }[]): Promise<Menu> => {
    const response = await apiClient.post<ApiResponse<Menu>>(`/admin/menus/${menuId}/reorder`, { items });
    return unwrapData<Menu>(response);
  },

  // Admin Menu Items
  createAdminMenuItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/admin/menu-items', data);
    return unwrapData<MenuItem>(response);
  },

  updateAdminMenuItem: async (id: number, data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/admin/menu-items/${id}`, data);
    return unwrapData<MenuItem>(response);
  },

  deleteAdminMenuItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/menu-items/${id}`);
  },

  // Admin Homepage Sections
  getAdminHomepageSections: async (): Promise<HomepageSection[]> => {
    const response = await apiClient.get<ApiResponse<HomepageSection[]>>('/admin/homepage/sections');
    return unwrapData<HomepageSection[]>(response);
  },

  createAdminHomepageSection: async (data: Partial<HomepageSection>): Promise<HomepageSection> => {
    const response = await apiClient.post<ApiResponse<HomepageSection>>('/admin/homepage/sections', data);
    return unwrapData<HomepageSection>(response);
  },

  updateAdminHomepageSection: async (id: number, data: Partial<HomepageSection>): Promise<HomepageSection> => {
    const response = await apiClient.put<ApiResponse<HomepageSection>>(`/admin/homepage/sections/${id}`, data);
    return unwrapData<HomepageSection>(response);
  },

  deleteAdminHomepageSection: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/homepage/sections/${id}`);
  },

  reorderAdminHomepageSections: async (sections: { id: number; sort_order: number }[]): Promise<HomepageSection[]> => {
    const response = await apiClient.post<ApiResponse<HomepageSection[]>>('/admin/homepage/sections/reorder', { sections });
    return unwrapData<HomepageSection[]>(response);
  },

  // Admin Redirects
  getAdminRedirects: async (params?: { page?: number; per_page?: number; q?: string }): Promise<ApiPaginatedResponse<Redirect>> => {
    const response = await apiClient.get<ApiPaginatedResponse<Redirect>>('/admin/redirects', { params });
    return unwrapPaginated<Redirect>(response);
  },

  createAdminRedirect: async (data: Partial<Redirect>): Promise<Redirect> => {
    const response = await apiClient.post<ApiResponse<Redirect>>('/admin/redirects', data);
    return unwrapData<Redirect>(response);
  },

  updateAdminRedirect: async (id: number, data: Partial<Redirect>): Promise<Redirect> => {
    const response = await apiClient.put<ApiResponse<Redirect>>(`/admin/redirects/${id}`, data);
    return unwrapData<Redirect>(response);
  },

  deleteAdminRedirect: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/redirects/${id}`);
  },
};
