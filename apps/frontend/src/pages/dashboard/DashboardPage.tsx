import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { api } from '../../lib/api';
import { StatCard, Card, Badge } from '../../components/ui';
import { SkeletonPageWithStats, SkeletonListItems } from '../../components/ui/Skeleton';

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

const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, loading };
};

const formatCurrency = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

  if (loading && !stats) return <SkeletonPageWithStats statCount={4} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-dark-primary">Dashboard</h1>
        <p className="text-theme-secondary-text mt-2">Bienvenido, {user?.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pacientes"
          value={stats?.totalPatients ?? 0}
          variant="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <StatCard
          title="Citas Hoy"
          value={stats?.todayAppointments ?? 0}
          variant="info"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <StatCard
          title="Ventas del Mes"
          value={formatCurrency(stats?.monthRevenue ?? 0)}
          variant="success"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Stock Bajo"
          value={stats?.lowStockCount ?? 0}
          variant={stats?.lowStockCount ? 'warning' : 'default'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Lower panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card elevation="low" className="!p-6">
          <h2 className="text-xl font-bold text-theme-dark-primary mb-4">Citas de Hoy</h2>
          {loading ? (
            <SkeletonListItems count={3} />
          ) : stats?.upcomingAppointments.length ? (
            <div className="space-y-3">
              {stats.upcomingAppointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-theme-light-primary/20 rounded-xl">
                  <div>
                    <p className="font-medium text-theme-dark-primary">{apt.patientName}</p>
                    <p className="text-sm text-theme-secondary-text">
                      {TYPE_LABELS[apt.type] ?? apt.type} — {apt.time}
                    </p>
                  </div>
                  <Badge
                    variant={apt.status === 'confirmed' ? 'success' : 'info'}
                    size="sm"
                  >
                    {apt.status === 'confirmed' ? 'Confirmada' : 'Programada'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-theme-secondary-text py-8">No hay citas para hoy</p>
          )}
        </Card>

        <Card elevation="low" className="!p-6">
          <h2 className="text-xl font-bold text-theme-dark-primary mb-4">Productos Más Vendidos (este mes)</h2>
          {loading ? (
            <SkeletonListItems count={3} />
          ) : stats?.topProducts.length ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-theme-light-primary/20 rounded-xl">
                  <div>
                    <p className="font-medium text-theme-dark-primary">{product.productName}</p>
                    <p className="text-sm text-theme-secondary-text">{product.quantitySold} unidades</p>
                  </div>
                  <Badge variant="primary" size="sm">#{i + 1}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-theme-secondary-text py-8">Sin ventas completadas este mes</p>
          )}
        </Card>
      </div>
    </div>
  );
};
