import type { AuthResponse, LoginCredentials, User } from '../types';

const MOCK_USERS: User[] = [
  {
    id: 'USR001',
    email: 'admin@visionkit.com',
    name: 'Admin Principal',
    role: 'admin',
    phone: '555-0001',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Principal&background=DC2626&color=fff',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'USR002',
    email: 'gerente@visionkit.com',
    name: 'Gerente Principal',
    role: 'manager',
    phone: '555-0002',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Gerente+Principal&background=2563EB&color=fff',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'USR003',
    email: 'optico1@visionkit.com',
    name: 'María García',
    role: 'optician',
    phone: '555-0003',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=059669&color=fff',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'USR004',
    email: 'optico2@visionkit.com',
    name: 'Carlos Rodríguez',
    role: 'optician',
    phone: '555-0004',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=059669&color=fff',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

const MOCK_DELAY = 1000;

// Password mock: todos los usuarios tienen password "123456" en este demo
const MOCK_PASSWORD = '123456';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === credentials.email);

        if (!user) {
          reject(new Error('Usuario no encontrado'));
          return;
        }

        if (user.status === 'inactive') {
          reject(new Error('Usuario inactivo. Contacte al administrador.'));
          return;
        }

        // Validar password (en producción esto se haría en el backend)
        if (credentials.password !== MOCK_PASSWORD) {
          reject(new Error('Contraseña incorrecta'));
          return;
        }

        resolve({
          user,
          token: `mock-jwt-token-${user.id}-${Date.now()}`
        });
      }, MOCK_DELAY);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        resolve();
      }, 500);
    });
  },

  getUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          resolve(null);
          return;
        }

        const userStr = localStorage.getItem('auth_user');
        if (!userStr) {
          resolve(null);
          return;
        }

        try {
          const user = JSON.parse(userStr);
          resolve(user);
        } catch {
          resolve(null);
        }
      }, 300);
    });
  }
};
