export type UserRole = 'admin' | 'manager' | 'optician';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Permission {
  // Ventas
  canCreateSale: boolean;
  canViewSales: boolean;
  canCancelSale: boolean;
  canRefundSale: boolean;
  canViewReports: boolean;

  // Pacientes
  canCreatePatient: boolean;
  canEditPatient: boolean;
  canViewPatients: boolean;
  canDeletePatient: boolean;

  // Inventario
  canCreateProduct: boolean;
  canEditProduct: boolean;
  canViewInventory: boolean;
  canAdjustStock: boolean;
  canDeleteProduct: boolean;

  // Historias Clínicas
  canCreateMedicalRecord: boolean;
  canEditMedicalRecord: boolean;
  canViewMedicalRecords: boolean;

  // Usuarios
  canCreateUser: boolean;
  canEditUser: boolean;
  canViewUsers: boolean;
  canDeleteUser: boolean;

  // Configuración
  canAccessSettings: boolean;
  canEditClinicInfo: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    // Admin tiene acceso total
    canCreateSale: true,
    canViewSales: true,
    canCancelSale: true,
    canRefundSale: true,
    canViewReports: true,
    canCreatePatient: true,
    canEditPatient: true,
    canViewPatients: true,
    canDeletePatient: true,
    canCreateProduct: true,
    canEditProduct: true,
    canViewInventory: true,
    canAdjustStock: true,
    canDeleteProduct: true,
    canCreateMedicalRecord: true,
    canEditMedicalRecord: true,
    canViewMedicalRecords: true,
    canCreateUser: true,
    canEditUser: true,
    canViewUsers: true,
    canDeleteUser: true,
    canAccessSettings: true,
    canEditClinicInfo: true
  },
  manager: {
    // Gerente puede ver reportes y dar de baja ventas
    canCreateSale: true,
    canViewSales: true,
    canCancelSale: true, // Puede dar de baja ventas
    canRefundSale: true,
    canViewReports: true, // Acceso a reportes
    canCreatePatient: true,
    canEditPatient: true,
    canViewPatients: true,
    canDeletePatient: false,
    canCreateProduct: true,
    canEditProduct: true,
    canViewInventory: true,
    canAdjustStock: true,
    canDeleteProduct: false,
    canCreateMedicalRecord: true,
    canEditMedicalRecord: true,
    canViewMedicalRecords: true,
    canCreateUser: true, // Puede crear ópticos
    canEditUser: true,
    canViewUsers: true,
    canDeleteUser: false,
    canAccessSettings: true,
    canEditClinicInfo: false
  },
  optician: {
    // Óptico hace ventas y maneja pacientes
    canCreateSale: true,
    canViewSales: true, // Solo sus ventas
    canCancelSale: false,
    canRefundSale: false,
    canViewReports: false,
    canCreatePatient: true,
    canEditPatient: true,
    canViewPatients: true,
    canDeletePatient: false,
    canCreateProduct: false,
    canEditProduct: false,
    canViewInventory: true, // Solo lectura
    canAdjustStock: false,
    canDeleteProduct: false,
    canCreateMedicalRecord: true,
    canEditMedicalRecord: true,
    canViewMedicalRecords: true,
    canCreateUser: false,
    canEditUser: false,
    canViewUsers: false,
    canDeleteUser: false,
    canAccessSettings: false,
    canEditClinicInfo: false
  }
};
