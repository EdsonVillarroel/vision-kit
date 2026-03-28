import type { User, UserRole } from '../../auth/types';

export type { User, UserRole };

export interface UserFormData {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  password?: string; // Para crear/actualizar contraseña
}

export interface UserFilters {
  role?: UserRole;
  status?: 'active' | 'inactive';
  search?: string;
}
