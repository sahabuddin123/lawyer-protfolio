import { apiClient } from './client';
import type { ApiResponse, ApiPaginatedResponse, SiteSetting, Menu, MenuItem, Page, HomepageSection, Redirect } from '@/types';

export const cmsApi = {
  // Public APIs
  getPublicSettings: async (group?: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>('/settings', {
      params: group ? { group } : undefined,
    });
    return response.data.data;
  },

  getPublicNavigation: async (): Promise<Record<string, Menu>> => {
    const response = await apiClient.get<ApiResponse<Record<string, Menu>>>('/navigation');
    return response.data.data;
  },

  getPublicPage: async (slug: string): Promise<Page> => {
    const response = await apiClient.get<ApiResponse<Page>>(`/pages/${slug}`);
    return response.data.data;
  },

  getPublicHome: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/home');
    return response.data.data;
  },

  // Admin Settings APIs
  getAdminSettings: async (group?: string): Promise<SiteSetting[]> => {
    const response = await apiClient.get<ApiResponse<SiteSetting[]>>('/admin/settings', {
      params: group ? { group } : undefined,
    });
    return response.data.data;
  },

  updateAdminSettings: async (settings: { key: string; value: any; group?: string; is_public?: boolean }[]): Promise<SiteSetting[]> => {
    const response = await apiClient.put<ApiResponse<SiteSetting[]>>('/admin/settings', { settings });
    return response.data.data;
  },

  // Admin Pages APIs
  getAdminPages: async (params?: { page?: number; per_page?: number; status?: string; q?: string }): Promise<ApiPaginatedResponse<Page>> => {
    const response = await apiClient.get<ApiPaginatedResponse<Page>>('/admin/pages', { params });
    return response.data;
  },

  getAdminPage: async (id: number): Promise<Page> => {
    const response = await apiClient.get<ApiResponse<Page>>(`/admin/pages/${id}`);
    return response.data.data;
  },

  createAdminPage: async (data: Partial<Page>): Promise<Page> => {
    const response = await apiClient.post<ApiResponse<Page>>('/admin/pages', data);
    return response.data.data;
  },

  updateAdminPage: async (id: number, data: Partial<Page>): Promise<Page> => {
    const response = await apiClient.put<ApiResponse<Page>>(`/admin/pages/${id}`, data);
    return response.data.data;
  },

  deleteAdminPage: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/pages/${id}`);
  },

  // Admin Navigation Menus
  getAdminMenus: async (): Promise<Menu[]> => {
    const response = await apiClient.get<ApiResponse<Menu[]>>('/admin/menus');
    return response.data.data;
  },

  createAdminMenu: async (data: { location: string; title: string }): Promise<Menu> => {
    const response = await apiClient.post<ApiResponse<Menu>>('/admin/menus', data);
    return response.data.data;
  },

  updateAdminMenu: async (id: number, data: { location: string; title: string }): Promise<Menu> => {
    const response = await apiClient.put<ApiResponse<Menu>>(`/admin/menus/${id}`, data);
    return response.data.data;
  },

  deleteAdminMenu: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/menus/${id}`);
  },

  reorderAdminMenuItems: async (menuId: number, items: { id: number; sort_order: number; parent_id?: number | null }[]): Promise<Menu> => {
    const response = await apiClient.post<ApiResponse<Menu>>(`/admin/menus/${menuId}/reorder`, { items });
    return response.data.data;
  },

  // Admin Menu Items
  createAdminMenuItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/admin/menu-items', data);
    return response.data.data;
  },

  updateAdminMenuItem: async (id: number, data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/admin/menu-items/${id}`, data);
    return response.data.data;
  },

  deleteAdminMenuItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/menu-items/${id}`);
  },

  // Admin Homepage Sections
  getAdminHomepageSections: async (): Promise<HomepageSection[]> => {
    const response = await apiClient.get<ApiResponse<HomepageSection[]>>('/admin/homepage/sections');
    return response.data.data;
  },

  updateAdminHomepageSection: async (id: number, data: Partial<HomepageSection>): Promise<HomepageSection> => {
    const response = await apiClient.put<ApiResponse<HomepageSection>>(`/admin/homepage/sections/${id}`, data);
    return response.data.data;
  },

  reorderAdminHomepageSections: async (sections: { id: number; sort_order: number }[]): Promise<HomepageSection[]> => {
    const response = await apiClient.post<ApiResponse<HomepageSection[]>>('/admin/homepage/sections/reorder', { sections });
    return response.data.data;
  },

  // Admin Redirects
  getAdminRedirects: async (params?: { page?: number; per_page?: number; q?: string }): Promise<ApiPaginatedResponse<Redirect>> => {
    const response = await apiClient.get<ApiPaginatedResponse<Redirect>>('/admin/redirects', { params });
    return response.data;
  },

  createAdminRedirect: async (data: Partial<Redirect>): Promise<Redirect> => {
    const response = await apiClient.post<ApiResponse<Redirect>>('/admin/redirects', data);
    return response.data.data;
  },

  updateAdminRedirect: async (id: number, data: Partial<Redirect>): Promise<Redirect> => {
    const response = await apiClient.put<ApiResponse<Redirect>>(`/admin/redirects/${id}`, data);
    return response.data.data;
  },

  deleteAdminRedirect: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/redirects/${id}`);
  },
};
