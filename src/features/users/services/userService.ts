import type { User, UserFormData } from '../types';

// Los usuarios mock iniciales
let users: User[] = [
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

let userCounter = 5;

const generateAvatar = (name: string, role: string) => {
  const colors = {
    admin: 'DC2626',
    manager: '2563EB',
    optician: '059669'
  };
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[role as keyof typeof colors]}&color=fff`;
};

export const userService = {
  getAll: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...users]);
      }, 400);
    });
  },

  getById: async (id: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = users.find(u => u.id === id);
        resolve(user || null);
      }, 300);
    });
  },

  create: async (data: UserFormData): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validar email único
        if (users.some(u => u.email === data.email)) {
          reject(new Error('El email ya está registrado'));
          return;
        }

        const newUser: User = {
          id: `USR${String(userCounter++).padStart(3, '0')}`,
          email: data.email,
          name: data.name,
          role: data.role,
          phone: data.phone,
          status: 'active',
          avatar: generateAvatar(data.name, data.role),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        users.push(newUser);
        resolve(newUser);
      }, 600);
    });
  },

  update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
          reject(new Error('Usuario no encontrado'));
          return;
        }

        // Validar email único si se está cambiando
        if (data.email && data.email !== users[index].email) {
          if (users.some(u => u.email === data.email && u.id !== id)) {
            reject(new Error('El email ya está registrado'));
            return;
          }
        }

        users[index] = {
          ...users[index],
          ...data,
          avatar: data.name ? generateAvatar(data.name, data.role || users[index].role) : users[index].avatar,
          updatedAt: new Date().toISOString()
        };

        resolve(users[index]);
      }, 600);
    });
  },

  toggleStatus: async (id: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
          reject(new Error('Usuario no encontrado'));
          return;
        }

        // No permitir desactivar el último admin
        if (users[index].role === 'admin' && users[index].status === 'active') {
          const activeAdmins = users.filter(u => u.role === 'admin' && u.status === 'active');
          if (activeAdmins.length === 1) {
            reject(new Error('No se puede desactivar el último administrador'));
            return;
          }
        }

        users[index] = {
          ...users[index],
          status: users[index].status === 'active' ? 'inactive' : 'active',
          updatedAt: new Date().toISOString()
        };

        resolve(users[index]);
      }, 500);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
          reject(new Error('Usuario no encontrado'));
          return;
        }

        // No permitir eliminar el último admin
        if (users[index].role === 'admin') {
          const activeAdmins = users.filter(u => u.role === 'admin' && u.status === 'active');
          if (activeAdmins.length === 1) {
            reject(new Error('No se puede eliminar el último administrador'));
            return;
          }
        }

        users.splice(index, 1);
        resolve();
      }, 400);
    });
  },

  // Obtener usuarios por rol (útil para selectores)
  getByRole: async (role: string): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = users.filter(u => u.role === role && u.status === 'active');
        resolve(filtered);
      }, 300);
    });
  },

  // Obtener usuarios activos (para asignar ventas, etc.)
  getActive: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const active = users.filter(u => u.status === 'active');
        resolve(active);
      }, 300);
    });
  }
};
