import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Button } from './components/ui/Button';
import { LoginPage } from './features/auth/components/LoginPage';
import { AuthProvider, useAuth } from './features/auth/hooks/useAuth';
import { ClinicSettingsProvider } from './features/settings/context/ClinicSettingsContext';
import { MainLayout, SidebarProvider, type MenuItem } from './features/layout';
import { AppRoutes } from './routes';
import { ThemeProvider } from './theme/ThemeContext';
import { SnackbarProvider } from './components/Snackbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setOn402Handler } from './lib/api';

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard'
  },
  {
    id: 'patients',
    label: 'Pacientes',
    icon: '👥',
    children: [
      {
        id: 'patients-list',
        label: 'Lista de Pacientes',
        icon: '📋',
        path: '/patients'
      },
      {
        id: 'patients-new',
        label: 'Nuevo Paciente',
        icon: '➕',
        path: '/patients/new'
      }
    ]
  },
  {
    id: 'appointments',
    label: 'Citas',
    icon: '📅',
    children: [
      {
        id: 'appointments-calendar',
        label: 'Calendario',
        icon: '🗓️',
        path: '/appointments'
      },
      {
        id: 'appointments-new',
        label: 'Nueva Cita',
        icon: '➕',
        path: '/appointments/new'
      },
      {
        id: 'appointments-pending',
        label: 'Pendientes',
        icon: '⏰',
        path: '/appointments/pending'
      }
    ]
  },
  {
    id: 'medical-records',
    label: 'Historia Clínica',
    icon: '🏥',
    children: [
      {
        id: 'medical-records-list',
        label: 'Historiales',
        icon: '📄',
        path: '/medical-records'
      },
      {
        id: 'medical-records-new',
        label: 'Nuevo Examen',
        icon: '👁️',
        path: '/medical-records/new'
      }
    ]
  },
  {
    id: 'sales',
    label: 'Ventas',
    icon: '💰',
    children: [
      {
        id: 'sales-list',
        label: 'Ventas',
        icon: '📊',
        path: '/sales'
      },
      {
        id: 'sales-new',
        label: 'Nueva Venta',
        icon: '🛒',
        path: '/sales/new'
      },
      {
        id: 'sales-reports',
        label: 'Reportes',
        icon: '📈',
        path: '/sales/reports'
      }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: '📦',
    children: [
      {
        id: 'inventory-list',
        label: 'Productos',
        icon: '📋',
        path: '/inventory'
      },
      {
        id: 'inventory-new',
        label: 'Nuevo Producto',
        icon: '➕',
        path: '/inventory/new'
      },
      {
        id: 'inventory-frames',
        label: 'Armazones',
        icon: '👓',
        path: '/inventory/frames'
      },
      {
        id: 'inventory-lenses',
        label: 'Lentes',
        icon: '🔬',
        path: '/inventory/lenses'
      },
      {
        id: 'inventory-stock',
        label: 'Control de Stock',
        icon: '📊',
        path: '/inventory/stock'
      },
      {
        id: 'inventory-alerts',
        label: 'Alertas',
        icon: '⚠️',
        path: '/inventory/alerts'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: '⚙️',
    children: [
      {
        id: 'settings-profile',
        label: 'Perfil',
        icon: '👤',
        path: '/settings/profile'
      },
      {
        id: 'settings-users',
        label: 'Usuarios',
        icon: '👥',
        path: '/settings/users'
      },
      {
        id: 'settings-clinic',
        label: 'Datos de Óptica',
        icon: '🏢',
        path: '/settings/clinic'
      },
      {
        id: 'settings-appearance',
        label: 'Apariencia',
        icon: '🎨',
        path: '/settings/appearance'
      }
    ]
  }
];

const Dashboard = () => {
  const { user, logout } = useAuth();

  const navbar = (
    <>
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2">
          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full border-2 border-theme-divider" />
          )}
          <span className="text-sm font-medium text-theme-text-icons hidden sm:inline">{user?.name}</span>
        </div>
        <div className="w-24">
          <Button variant="secondary" onClick={() => logout()} className="!py-2 text-sm">
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <SidebarProvider>
      <MainLayout menuItems={menuItems} navbar={navbar}>
        <AppRoutes />
      </MainLayout>
    </SidebarProvider>
  );
};

const SuspendedView = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#f5f2ff] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e5e1ff] p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Suscripción inactiva</h1>
        <p className="text-gray-500 text-sm mb-6">
          Tu cuenta está suspendida. Contacta con soporte para reactivar tu suscripción y recuperar el acceso.
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="https://wa.me/59168803830"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
          >
            Contactar soporte por WhatsApp
          </a>
          <button
            onClick={() => logout()}
            className="py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    setOn402Handler(() => setIsSuspended(true));
  }, []);

  // Reset suspended state on logout
  useEffect(() => {
    if (!isAuthenticated) setIsSuspended(false);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;
  if (isSuspended) return <SuspendedView />;
  return <Dashboard />;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/vision-kit">
        <ThemeProvider>
          <SnackbarProvider>
            <AuthProvider>
              <ClinicSettingsProvider>
                <AppContent />
              </ClinicSettingsProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
