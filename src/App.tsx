import { BrowserRouter } from 'react-router-dom';
import { Button } from './components/ui/Button';
import { LoginPage } from './features/auth/components/LoginPage';
import { AuthProvider, useAuth } from './features/auth/hooks/useAuth';
import { MainLayout, SidebarProvider, type MenuItem } from './features/layout';
import { AppRoutes } from './routes';
import { ThemeProvider } from './theme/ThemeContext';
import { SnackbarProvider } from './components/Snackbar';

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

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SnackbarProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
