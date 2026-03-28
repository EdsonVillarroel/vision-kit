// services/authService.ts
import { api } from '../../../lib/api';
import type { AuthResponse, LoginCredentials, User } from '../types';

// Respuesta real del backend: { access_token, user }
interface BackendAuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await api.post<BackendAuthResponse>('/auth/login', credentials);
    return {
      user: data.user,
      token: data.access_token,
    };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      return await api.get<User>('/auth/me');
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return null;
    }
  },
};
