export interface PlatformAdmin {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  admin: PlatformAdmin;
  token: string;
}
