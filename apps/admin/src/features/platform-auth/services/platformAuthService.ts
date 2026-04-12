import { api } from '../../../lib/api';
import type { AuthResponse, LoginCredentials, PlatformAdmin } from '../types';

interface BackendLoginResponse {
  access_token: string;
  admin: PlatformAdmin;
}

export const platformAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await api.post<BackendLoginResponse>('/platform/auth/login', credentials);
    return { admin: data.admin, token: data.access_token };
  },

  getAdmin: async (): Promise<PlatformAdmin | null> => {
    const token = localStorage.getItem('platform_token');
    if (!token) return null;
    try {
      return await api.get<PlatformAdmin>('/platform/auth/me');
    } catch {
      localStorage.removeItem('platform_token');
      localStorage.removeItem('platform_admin');
      return null;
    }
  },

  logout: (): void => {
    localStorage.removeItem('platform_token');
    localStorage.removeItem('platform_admin');
  },

  refreshToken: async (): Promise<{ access_token: string } | null> => {
    try {
      return await api.post<{ access_token: string }>('/platform/auth/refresh');
    } catch {
      return null;
    }
  },
};
