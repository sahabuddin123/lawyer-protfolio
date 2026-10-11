import { apiClient } from './client';
import { ApiResponse, ApiPaginatedResponse } from '@/types';
import {
  PublicContactConfig,
  ContactMessage,
  ContactMessageDetail,
  ConsultationRequest,
  ConsultationRequestDetail,
  ContactFormPayload,
  ConsultationFormPayload,
  ContactStatus,
  ConsultationStatus,
} from '@/types/contact';

export const contactApi = {
  // Public Endpoints
  getPublicContactConfig: async (): Promise<ApiResponse<PublicContactConfig>> => {
    return apiClient.get('/contact');
  },

  submitContactForm: async (
    payload: ContactFormPayload
  ): Promise<ApiResponse<{ id: number; received: boolean }>> => {
    return apiClient.post('/contact', payload);
  },

  submitConsultationForm: async (
    payload: ConsultationFormPayload
  ): Promise<ApiResponse<{ id: number; received: boolean }>> => {
    return apiClient.post('/consultation', payload);
  },

  // Admin Contact Messages
  getAdminContactMessages: async (
    params?: Record<string, any>
  ): Promise<ApiPaginatedResponse<ContactMessage>> => {
    return apiClient.get('/admin/contacts', { params });
  },

  getAdminContactMessage: async (
    id: number
  ): Promise<ApiResponse<ContactMessageDetail>> => {
    return apiClient.get(`/admin/contacts/${id}`);
  },

  updateAdminContactMessage: async (
    id: number,
    payload: { status?: ContactStatus; admin_notes?: string }
  ): Promise<ApiResponse<ContactMessageDetail>> => {
    return apiClient.patch(`/admin/contacts/${id}`, payload);
  },

  deleteAdminContactMessage: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/contacts/${id}`);
  },

  // Admin Consultation Requests
  getAdminConsultations: async (
    params?: Record<string, any>
  ): Promise<ApiPaginatedResponse<ConsultationRequest>> => {
    return apiClient.get('/admin/consultations', { params });
  },

  getAdminConsultation: async (
    id: number
  ): Promise<ApiResponse<ConsultationRequestDetail>> => {
    return apiClient.get(`/admin/consultations/${id}`);
  },

  updateAdminConsultation: async (
    id: number,
    payload: { status?: ConsultationStatus; admin_notes?: string }
  ): Promise<ApiResponse<ConsultationRequestDetail>> => {
    return apiClient.patch(`/admin/consultations/${id}`, payload);
  },

  deleteAdminConsultation: async (
    id: number
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/consultations/${id}`);
  },
};
