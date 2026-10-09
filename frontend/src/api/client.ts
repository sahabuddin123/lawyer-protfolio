import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Universal Axios HTTP Client
 * Automatically attaches locale and handles common error envelopes
 */

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const activeLocale = localStorage.getItem('nijam_locale') || 'en';
      config.headers['Accept-Language'] = activeLocale;

      const token = localStorage.getItem('nijam_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('nijam_auth_token');
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);
