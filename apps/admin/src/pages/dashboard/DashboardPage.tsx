import { Link } from 'react-router-dom';
import { useDashboard } from '../../features/dashboard';
import { StatCard, SkeletonPageWithStats } from '../../components/ui';

export const DashboardPage = () => {
  const { stats, loading, error } = useDashboard();

  if (loading) return <SkeletonPageWithStats statCount={4} tableRows={0} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-theme-dark-primary">Dashboard</h1>
        <p className="text-theme-secondary-text mt-1">Resumen global de la plataforma Vision Kit</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tenants Activos"
          value={stats.tenants.active}
          variant="primary"
          trend={{ value: stats.tenants.newThisMonth, isPositive: true }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="MRR"
          value={`Bs ${stats.subscriptions.mrr.toLocaleString()}`}
          variant="success"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Usuarios"
          value={stats.users.total}
          variant="info"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Pacientes"
          value={stats.patients.total}
          variant="default"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* Tenant Status Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
          <h2 className="text-lg font-semibold text-theme-dark-primary mb-4">Estado de Tenants</h2>
          <div className="space-y-3">
            {[
              { label: 'Activos', value: stats.tenants.active, color: 'bg-green-500', textColor: 'text-green-700' },
              { label: 'Suspendidos', value: stats.tenants.suspended, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
              { label: 'Cancelados', value: stats.tenants.cancelled, color: 'bg-red-500', textColor: 'text-red-700' },
              { label: 'Nuevos este mes', value: stats.tenants.newThisMonth, color: 'bg-theme-primary', textColor: 'text-theme-primary' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-theme-primary-text">{item.label}</span>
                </div>
                <span className={`text-sm font-bold ${item.textColor}`}>{item.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-theme-divider/30 flex justify-between">
              <span className="text-sm font-medium text-theme-secondary-text">Total tenants</span>
              <span className="text-sm font-bold text-theme-dark-primary">{stats.tenants.total}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
          <h2 className="text-lg font-semibold text-theme-dark-primary mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nuevo Tenant', path: '/tenants/new', icon: '🏢', color: 'from-theme-primary to-theme-dark-primary' },
              { label: 'Ver Tenants', path: '/tenants', icon: '📋', color: 'from-indigo-500 to-indigo-700' },
              { label: 'Suscripciones', path: '/subscriptions', icon: '💳', color: 'from-violet-500 to-violet-700' },
              { label: 'Planes', path: '/plans', icon: '📦', color: 'from-blue-500 to-blue-700' },
            ].map(action => (
              <Link
                key={action.path}
                to={action.path}
                className={`bg-gradient-to-br ${action.color} text-white rounded-xl p-4 hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-semibold">{action.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-theme-dark-primary">Suscripciones Activas</h2>
            <p className="text-sm text-theme-secondary-text mt-1">
              {stats.subscriptions.active} suscripción{stats.subscriptions.active !== 1 ? 'es' : ''} activa{stats.subscriptions.active !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">Bs {stats.subscriptions.mrr.toLocaleString()}</p>
            <p className="text-sm text-theme-secondary-text">MRR ({stats.subscriptions.currency})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
