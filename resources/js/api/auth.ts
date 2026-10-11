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
    const raw: any = await apiClient.post('/auth/login', payload);
    const res: ApiResponse<LoginResponseData> = raw?.data?.success !== undefined ? raw.data : raw;
    if (res.success && res.data?.token) {
      localStorage.setItem('nijam_auth_token', res.data.token);
    }
    return res;
  },

  /**
   * Terminate active session and clear client credentials
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const raw: any = await apiClient.post('/auth/logout');
      return raw?.data?.success !== undefined ? raw.data : raw;
    } finally {
      localStorage.removeItem('nijam_auth_token');
    }
  },

  /**
   * Fetch currently authenticated user with assigned roles and permissions
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const raw: any = await apiClient.get('/auth/me');
    return raw?.data?.success !== undefined ? raw.data : raw;
  },

  /**
   * Dispatch password reset instruction
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    const raw: any = await apiClient.post('/auth/forgot-password', payload);
    return raw?.data?.success !== undefined ? raw.data : raw;
  },

  /**
   * Execute password reset with verification token
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    const raw: any = await apiClient.post('/auth/reset-password', payload);
    return raw?.data?.success !== undefined ? raw.data : raw;
  },

  /**
   * Check if token is present locally
   */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('nijam_auth_token'));
  },
};
