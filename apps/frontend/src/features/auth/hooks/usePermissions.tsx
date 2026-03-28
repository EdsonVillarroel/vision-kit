import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS, type Permission } from '../types';

export const usePermissions = (): Permission => {
  const { user } = useAuth();

  if (!user) {
    // Usuario no autenticado - sin permisos
    return {
      canCreateSale: false,
      canViewSales: false,
      canCancelSale: false,
      canRefundSale: false,
      canViewReports: false,
      canCreatePatient: false,
      canEditPatient: false,
      canViewPatients: false,
      canDeletePatient: false,
      canCreateProduct: false,
      canEditProduct: false,
      canViewInventory: false,
      canAdjustStock: false,
      canDeleteProduct: false,
      canCreateMedicalRecord: false,
      canEditMedicalRecord: false,
      canViewMedicalRecords: false,
      canCreateUser: false,
      canEditUser: false,
      canViewUsers: false,
      canDeleteUser: false,
      canAccessSettings: false,
      canEditClinicInfo: false
    };
  }

  return ROLE_PERMISSIONS[user.role];
};

export const useHasPermission = (permissionKey: keyof Permission): boolean => {
  const permissions = usePermissions();
  return permissions[permissionKey];
};
