import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { SnackbarProvider } from './components/Snackbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlatformAuthProvider, usePlatformAuth, LoginPage } from './features/platform-auth';
import { MainLayout, SidebarProvider, type MenuItem } from './features/layout';
import { AdminRoutes } from './routes';
import { Button } from './components/ui';

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'metrics', label: 'Métricas', icon: '📈', path: '/metrics' },
  {
    id: 'tenants', label: 'Tenants', icon: '🏢',
    children: [
      { id: 'tenants-list', label: 'Lista de Tenants', icon: '📋', path: '/tenants' },
      { id: 'tenants-new', label: 'Nuevo Tenant', icon: '➕', path: '/tenants/new' },
    ],
  },
  { id: 'subscriptions', label: 'Suscripciones', icon: '💳', path: '/subscriptions' },
  { id: 'plans', label: 'Planes', icon: '📦', path: '/plans' },
];

const AdminPanel = () => {
  const { admin, logout } = usePlatformAuth();

  const navbar = (
    <div className="flex items-center gap-4 ml-auto">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-theme-accent/30 rounded-full flex items-center justify-center text-theme-text-icons text-sm font-bold">
          {admin?.name?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-theme-text-icons leading-tight">{admin?.name}</p>
          <p className="text-xs text-theme-text-icons/60 leading-tight">Platform Admin</p>
        </div>
      </div>
      <div className="w-24">
        <Button variant="secondary" onClick={logout} className="!py-2 text-sm">Salir</Button>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <MainLayout menuItems={menuItems} navbar={navbar}>
        <AdminRoutes />
      </MainLayout>
    </SidebarProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = usePlatformAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? <AdminPanel /> : <LoginPage />;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <SnackbarProvider>
            <PlatformAuthProvider>
              <AppContent />
            </PlatformAuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
