import { apiClient } from './client';
import {
  ApiResponse,
  LoginPayload,
  LoginResponseData,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  User,
} from '../types';

/**
 * Authentication API Service Client
 */
export const authApi = {
  /**
   * Authenticate administrative user and establish session token
   */
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('nijam_auth_token', response.data.data.token);
    }
    return response.data;
  },

  /**
   * Terminate active session and clear client credentials
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
      return response.data;
    } finally {
      localStorage.removeItem('nijam_auth_token');
    }
  },

  /**
   * Fetch currently authenticated user with assigned roles and permissions
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  /**
   * Dispatch password reset instruction
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', payload);
    return response.data;
  },

  /**
   * Execute password reset with verification token
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/reset-password', payload);
    return response.data;
  },

  /**
   * Check if token is present locally
   */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('nijam_auth_token'));
  },
};
