import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SkeletonPageWithStats } from '../components/ui';

const DashboardPage     = lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TenantsPage       = lazy(() => import('../pages/tenants/TenantsPage').then(m => ({ default: m.TenantsPage })));
const NewTenantPage     = lazy(() => import('../pages/tenants/NewTenantPage').then(m => ({ default: m.NewTenantPage })));
const ViewTenantPage    = lazy(() => import('../pages/tenants/ViewTenantPage').then(m => ({ default: m.ViewTenantPage })));
const EditTenantPage    = lazy(() => import('../pages/tenants/EditTenantPage').then(m => ({ default: m.EditTenantPage })));
const PlansPage         = lazy(() => import('../pages/plans/PlansPage').then(m => ({ default: m.PlansPage })));
const EditPlanPage      = lazy(() => import('../pages/plans/EditPlanPage').then(m => ({ default: m.EditPlanPage })));
const SubscriptionsPage = lazy(() => import('../pages/subscriptions/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const MetricsPage       = lazy(() => import('../pages/metrics/MetricsPage').then(m => ({ default: m.MetricsPage })));

const PageLoader = () => <SkeletonPageWithStats statCount={4} tableRows={8} />;

export const AdminRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/metrics" element={<MetricsPage />} />
      <Route path="/tenants" element={<TenantsPage />} />
      <Route path="/tenants/new" element={<NewTenantPage />} />
      <Route path="/tenants/:id" element={<ViewTenantPage />} />
      <Route path="/tenants/:id/edit" element={<EditTenantPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/plans/:id/edit" element={<EditPlanPage />} />
      <Route path="/subscriptions" element={<SubscriptionsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);
