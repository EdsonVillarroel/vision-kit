import { api } from '../../../lib/api';
import type { User, UserFormData } from '../types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    return api.get<User[]>('/users');
  },

  getById: async (id: string): Promise<User | null> => {
    try {
      return await api.get<User>(`/users/${id}`);
    } catch {
      return null;
    }
  },

  create: async (data: UserFormData): Promise<User> => {
    return api.post<User>('/users', data);
  },

  update: async (id: string, data: Partial<UserFormData & { status: 'active' | 'inactive' }>): Promise<User> => {
    return api.patch<User>(`/users/${id}`, data);
  },

  toggleStatus: async (id: string, currentStatus: 'active' | 'inactive'): Promise<User> => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    return api.patch<User>(`/users/${id}`, { status: newStatus });
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/users/${id}`);
  },

  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return api.patch(`/users/${id}/password`, { currentPassword, newPassword });
  },

  getByRole: async (role: string): Promise<User[]> => {
    const all = await api.get<User[]>('/users');
    return all.filter((u) => u.role === role && u.status === 'active');
  },

  getActive: async (): Promise<User[]> => {
    const all = await api.get<User[]>('/users');
    return all.filter((u) => u.status === 'active');
  },
};
