import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PatientsPage } from '../pages/patients/PatientsPage';
import { NewPatientPage } from '../pages/patients/NewPatientPage';
import { EditPatientPage } from '../pages/patients/EditPatientPage';
import { ViewPatientPage } from '../pages/patients/ViewPatientPage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { MedicalRecordsPage } from '../pages/medical-records/MedicalRecordsPage';
import { NewMedicalRecordPage } from '../pages/medical-records/NewMedicalRecordPage';
import { ViewMedicalRecordPage } from '../pages/medical-records/ViewMedicalRecordPage';
import { EditMedicalRecordPage } from '../pages/medical-records/EditMedicalRecordPage';
import { SalesPage } from '../pages/sales/SalesPage';
import { SalesListPage } from '../pages/sales/SalesListPage';
import { NewSalePage } from '../pages/sales/NewSalePage';
import { ViewSalePage } from '../pages/sales/ViewSalePage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { InventoryListPage } from '../pages/inventory/InventoryListPage';
import { NewProductPage } from '../pages/inventory/NewProductPage';
import { ViewProductPage } from '../pages/inventory/ViewProductPage';
import { EditProductPage } from '../pages/inventory/EditProductPage';
import { AdjustStockPage } from '../pages/inventory/AdjustStockPage';
import { FramesPage } from '../pages/inventory/FramesPage';
import { LensesPage } from '../pages/inventory/LensesPage';
import { StockControlPage } from '../pages/inventory/StockControlPage';
import { AlertsPage } from '../pages/inventory/AlertsPage';
import { ProfilePage } from '../pages/settings/ProfilePage';
import { UsersPage } from '../pages/settings/UsersPage';
import { UserFormPage } from '../pages/settings/UserFormPage';
import { ClinicPage } from '../pages/settings/ClinicPage';
import { AppearancePage } from '../pages/settings/AppearancePage';
import {
  ClinicalExamsListPage,
  NewClinicalExamPage,
  EditClinicalExamPage,
  ClinicalExamDetailsPage
} from '../pages/clinical-exams';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Pacientes */}
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/patients/new" element={<NewPatientPage />} />
      <Route path="/patients/:id" element={<ViewPatientPage />} />
      <Route path="/patients/:id/edit" element={<EditPatientPage />} />

      {/* Citas */}
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/appointments/new" element={<AppointmentsPage />} />
      <Route path="/appointments/pending" element={<AppointmentsPage />} />
      <Route path="/appointments/:id" element={<AppointmentsPage />} />

      {/* Historia Clínica */}
      <Route path="/medical-records" element={<MedicalRecordsPage />} />
      <Route path="/medical-records/new" element={<NewMedicalRecordPage />} />
      <Route path="/medical-records/:id" element={<ViewMedicalRecordPage />} />
      <Route path="/medical-records/:id/edit" element={<EditMedicalRecordPage />} />

      {/* Exámenes Clínicos */}
      <Route path="/clinical-exams" element={<ClinicalExamsListPage />} />
      <Route path="/clinical-exams/new" element={<NewClinicalExamPage />} />
      <Route path="/clinical-exams/:id" element={<ClinicalExamDetailsPage />} />
      <Route path="/clinical-exams/:id/edit" element={<EditClinicalExamPage />} />

      {/* Ventas */}
      <Route path="/sales" element={<SalesListPage />} />
      <Route path="/sales/new" element={<NewSalePage />} />
      <Route path="/sales/reports" element={<SalesPage />} />
      <Route path="/sales/:id" element={<ViewSalePage />} />

      {/* Inventario */}
      <Route path="/inventory" element={<InventoryListPage />} />
      <Route path="/inventory/new" element={<NewProductPage />} />
      <Route path="/inventory/products" element={<InventoryPage />} />
      <Route path="/inventory/frames" element={<FramesPage />} />
      <Route path="/inventory/lenses" element={<LensesPage />} />
      <Route path="/inventory/stock" element={<StockControlPage />} />
      <Route path="/inventory/alerts" element={<AlertsPage />} />
      <Route path="/inventory/:id" element={<ViewProductPage />} />
      <Route path="/inventory/:id/edit" element={<EditProductPage />} />
      <Route path="/inventory/:id/adjust" element={<AdjustStockPage />} />

      {/* Configuración */}
      <Route path="/settings/profile" element={<ProfilePage />} />
      <Route path="/settings/users" element={<UsersPage />} />
      <Route path="/settings/users/new" element={<UserFormPage />} />
      <Route path="/settings/users/:id/edit" element={<UserFormPage />} />
      <Route path="/settings/clinic" element={<ClinicPage />} />
      <Route path="/settings/appearance" element={<AppearancePage />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
