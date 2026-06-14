import { lazy, Suspense } from 'react';
import { SkeletonPageWithStats } from '../components/ui';
import { Navigate, Route, Routes } from 'react-router-dom';

// ─── Lazy imports por feature ─────────────────────────────────────────────────
const DashboardPage       = lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));

const PatientsPage        = lazy(() => import('../pages/patients/PatientsPage').then(m => ({ default: m.PatientsPage })));
const NewPatientPage      = lazy(() => import('../pages/patients/NewPatientPage').then(m => ({ default: m.NewPatientPage })));
const EditPatientPage     = lazy(() => import('../pages/patients/EditPatientPage').then(m => ({ default: m.EditPatientPage })));
const ViewPatientPage     = lazy(() => import('../pages/patients/ViewPatientPage').then(m => ({ default: m.ViewPatientPage })));

const AppointmentsPage    = lazy(() => import('../pages/appointments/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })));

const MedicalRecordsPage  = lazy(() => import('../pages/medical-records/MedicalRecordsPage').then(m => ({ default: m.MedicalRecordsPage })));
const NewMedicalRecordPage   = lazy(() => import('../pages/medical-records/NewMedicalRecordPage').then(m => ({ default: m.NewMedicalRecordPage })));
const ViewMedicalRecordPage  = lazy(() => import('../pages/medical-records/ViewMedicalRecordPage').then(m => ({ default: m.ViewMedicalRecordPage })));
const EditMedicalRecordPage  = lazy(() => import('../pages/medical-records/EditMedicalRecordPage').then(m => ({ default: m.EditMedicalRecordPage })));

const SalesPage           = lazy(() => import('../pages/sales/SalesPage').then(m => ({ default: m.SalesPage })));
const SalesListPage       = lazy(() => import('../pages/sales/SalesListPage').then(m => ({ default: m.SalesListPage })));
const NewSalePage         = lazy(() => import('../pages/sales/NewSalePage').then(m => ({ default: m.NewSalePage })));
const ViewSalePage        = lazy(() => import('../pages/sales/ViewSalePage').then(m => ({ default: m.ViewSalePage })));

const InventoryPage       = lazy(() => import('../pages/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const InventoryListPage   = lazy(() => import('../pages/inventory/InventoryListPage').then(m => ({ default: m.InventoryListPage })));
const NewProductPage      = lazy(() => import('../pages/inventory/NewProductPage').then(m => ({ default: m.NewProductPage })));
const ViewProductPage     = lazy(() => import('../pages/inventory/ViewProductPage').then(m => ({ default: m.ViewProductPage })));
const EditProductPage     = lazy(() => import('../pages/inventory/EditProductPage').then(m => ({ default: m.EditProductPage })));
const AdjustStockPage     = lazy(() => import('../pages/inventory/AdjustStockPage').then(m => ({ default: m.AdjustStockPage })));
const FramesPage          = lazy(() => import('../pages/inventory/FramesPage').then(m => ({ default: m.FramesPage })));
const LensesPage          = lazy(() => import('../pages/inventory/LensesPage').then(m => ({ default: m.LensesPage })));
const StockControlPage    = lazy(() => import('../pages/inventory/StockControlPage').then(m => ({ default: m.StockControlPage })));
const AlertsPage          = lazy(() => import('../pages/inventory/AlertsPage').then(m => ({ default: m.AlertsPage })));

const ProfilePage         = lazy(() => import('../pages/settings/ProfilePage').then(m => ({ default: m.ProfilePage })));
const UsersPage           = lazy(() => import('../pages/settings/UsersPage').then(m => ({ default: m.UsersPage })));
const UserFormPage        = lazy(() => import('../pages/settings/UserFormPage').then(m => ({ default: m.UserFormPage })));
const ClinicPage          = lazy(() => import('../pages/settings/ClinicPage').then(m => ({ default: m.ClinicPage })));
const AppearancePage      = lazy(() => import('../pages/settings/AppearancePage').then(m => ({ default: m.AppearancePage })));
const MyPlanPage          = lazy(() => import('../pages/settings/MyPlanPage').then(m => ({ default: m.MyPlanPage })));

const ClinicalExamsListPage   = lazy(() => import('../pages/clinical-exams').then(m => ({ default: m.ClinicalExamsListPage })));
const NewClinicalExamPage     = lazy(() => import('../pages/clinical-exams').then(m => ({ default: m.NewClinicalExamPage })));
const EditClinicalExamPage    = lazy(() => import('../pages/clinical-exams').then(m => ({ default: m.EditClinicalExamPage })));
const ClinicalExamDetailsPage = lazy(() => import('../pages/clinical-exams').then(m => ({ default: m.ClinicalExamDetailsPage })));

const CommissionsPage     = lazy(() => import('../pages/commissions/CommissionsPage').then(m => ({ default: m.CommissionsPage })));

const MetricsPage         = lazy(() => import('../pages/metrics/MetricsPage'));

// ─── Fallback de carga ────────────────────────────────────────────────────────
const PageLoader = () => <SkeletonPageWithStats statCount={4} tableRows={8} />;

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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

        {/* Comisiones (solo admin/super_admin — protegido adentro de la página) */}
        <Route path="/commissions" element={<CommissionsPage />} />

        {/* Métricas (solo admin/super_admin) */}
        <Route path="/metrics" element={<MetricsPage />} />

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
        <Route path="/settings/plan" element={<MyPlanPage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
