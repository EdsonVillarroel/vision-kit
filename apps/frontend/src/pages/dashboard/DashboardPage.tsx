import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { api } from '../../lib/api';
import { SkeletonStatValue, SkeletonListItems } from '../../components/ui/Skeleton';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthRevenue: number;
  lowStockCount: number;
  upcomingAppointments: {
    id: string;
    patientName: string;
    type: string;
    time: string;
    status: string;
  }[];
  topProducts: {
    productName: string;
    quantitySold: number;
  }[];
}

const TYPE_LABELS: Record<string, string> = {
  'eye-exam': 'Examen Visual',
  'eye_exam': 'Examen Visual',
  'contact-lens-fitting': 'Adaptación Lentes',
  'contact_lens_fitting': 'Adaptación Lentes',
  followup: 'Seguimiento',
  emergency: 'Emergencia',
  'frame-selection': 'Selección Armazón',
  'frame_selection': 'Selección Armazón',
  adjustment: 'Ajuste',
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const firstOfMonth = `${today.slice(0, 7)}-01`;

        const [patients, todayApts, alerts, summary] = await Promise.allSettled([
          api.get<unknown[]>('/patients'),
          api.get<{ id: string; patient?: { firstName: string; lastName: string }; type: string; time: string; status: string }[]>(`/appointments?date=${today}`),
          api.get<unknown[]>('/inventory/alerts'),
          api.get<{ totalRevenue: number; topProducts: { productName: string; quantitySold: number }[] }>(`/sales/summary?from=${firstOfMonth}&to=${today}`),
        ]);

        const patientsData = patients.status === 'fulfilled' ? patients.value : [];
        const apts = todayApts.status === 'fulfilled' ? todayApts.value : [];
        const alertsData = alerts.status === 'fulfilled' ? alerts.value : [];
        const summaryData = summary.status === 'fulfilled' ? summary.value : null;

        const upcoming = apts
          .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
          .slice(0, 5)
          .map(a => ({
            id: a.id,
            patientName: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Paciente',
            type: a.type,
            time: typeof a.time === 'string' ? a.time.slice(0, 5) : a.time,
            status: a.status,
          }));

        setStats({
          totalPatients: patientsData.length,
          todayAppointments: apts.length,
          monthRevenue: summaryData?.totalRevenue ?? 0,
          lowStockCount: alertsData.length,
          upcomingAppointments: upcoming,
          topProducts: summaryData?.topProducts?.slice(0, 3) ?? [],
        });
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {user?.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pacientes</p>
              {loading ? <SkeletonStatValue /> : (
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPatients ?? 0}</p>
              )}
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citas Hoy</p>
              {loading ? <SkeletonStatValue /> : (
                <p className="text-2xl font-bold text-gray-900">{stats?.todayAppointments ?? 0}</p>
              )}
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas del Mes</p>
              {loading ? <SkeletonStatValue /> : (
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.monthRevenue ?? 0)}</p>
              )}
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              {loading ? <SkeletonStatValue /> : (
                <p className={`text-2xl font-bold ${stats?.lowStockCount ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats?.lowStockCount ?? 0}
                </p>
              )}
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Lower panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Citas de Hoy</h2>
          {loading ? (
            <SkeletonListItems count={3} />
          ) : stats?.upcomingAppointments.length ? (
            <div className="space-y-3">
              {stats.upcomingAppointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patientName}</p>
                    <p className="text-sm text-gray-600">
                      {TYPE_LABELS[apt.type] ?? apt.type} — {apt.time}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    apt.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {apt.status === 'confirmed' ? 'Confirmada' : 'Programada'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay citas para hoy</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Productos Más Vendidos (este mes)</h2>
          {loading ? (
            <SkeletonListItems count={3} />
          ) : stats?.topProducts.length ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">{product.quantitySold} unidades</p>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Sin ventas completadas este mes</p>
          )}
        </div>
      </div>
    </div>
  );
};
