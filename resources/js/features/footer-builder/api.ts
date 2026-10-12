import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/types';
import type {
  FooterTemplate,
  FooterRevision,
  CanonicalData,
  PublicFooterPayload,
  FooterLayoutData,
} from './types';

// Helper to unwrap standard response payload
const unwrap = <T>(res: any): T => {
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

export const footerBuilderApi = {
  // Public Endpoint
  getPublicFooter: async (locale?: string): Promise<PublicFooterPayload> => {
    const response = await apiClient.get<ApiResponse<PublicFooterPayload>>('/footer', {
      params: locale ? { locale } : undefined,
    });
    return unwrap<PublicFooterPayload>(response);
  },

  // Admin Endpoints
  getTemplates: async (): Promise<FooterTemplate[]> => {
    const response = await apiClient.get<ApiResponse<FooterTemplate[]>>('/admin/footer-builder/templates');
    return unwrap<FooterTemplate[]>(response);
  },

  getTemplate: async (id: number): Promise<FooterTemplate> => {
    const response = await apiClient.get<ApiResponse<FooterTemplate>>(`/admin/footer-builder/templates/${id}`);
    return unwrap<FooterTemplate>(response);
  },

  createTemplate: async (data: {
    name: string;
    slug?: string;
    preset?: string;
    display_conditions?: any;
    layout_data?: FooterLayoutData;
  }): Promise<FooterTemplate> => {
    const response = await apiClient.post<ApiResponse<FooterTemplate>>('/admin/footer-builder/templates', data);
    return unwrap<FooterTemplate>(response);
  },

  updateDraft: async (
    id: number,
    data: {
      name?: string;
      display_conditions?: any;
      layout_data: FooterLayoutData;
    }
  ): Promise<FooterTemplate> => {
    const response = await apiClient.put<ApiResponse<FooterTemplate>>(`/admin/footer-builder/templates/${id}`, data);
    return unwrap<FooterTemplate>(response);
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/footer-builder/templates/${id}`);
  },

  publishTemplate: async (id: number, changeSummary?: string): Promise<FooterTemplate> => {
    const response = await apiClient.post<ApiResponse<FooterTemplate>>(`/admin/footer-builder/templates/${id}/publish`, {
      change_summary: changeSummary,
    });
    return unwrap<FooterTemplate>(response);
  },

  duplicateTemplate: async (id: number): Promise<FooterTemplate> => {
    const response = await apiClient.post<ApiResponse<FooterTemplate>>(`/admin/footer-builder/templates/${id}/duplicate`);
    return unwrap<FooterTemplate>(response);
  },

  getRevisions: async (id: number): Promise<FooterRevision[]> => {
    const response = await apiClient.get<ApiResponse<FooterRevision[]>>(`/admin/footer-builder/templates/${id}/revisions`);
    return unwrap<FooterRevision[]>(response);
  },

  restoreRevision: async (id: number, revisionId: number): Promise<FooterTemplate> => {
    const response = await apiClient.post<ApiResponse<FooterTemplate>>(
      `/admin/footer-builder/templates/${id}/revisions/${revisionId}/restore`
    );
    return unwrap<FooterTemplate>(response);
  },

  getCanonicalData: async (): Promise<CanonicalData> => {
    const response = await apiClient.get<ApiResponse<CanonicalData>>('/admin/footer-builder/canonical-data');
    return unwrap<CanonicalData>(response);
  },
};
