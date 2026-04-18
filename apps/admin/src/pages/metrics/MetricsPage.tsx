import { useMetrics } from '../../features/metrics';
import {
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Button,
} from '../../components/ui';

const formatBs = (value: number) =>
  `Bs ${value.toLocaleString('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatPct = (value: number) => `${value.toLocaleString('es-BO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})}%`;

export const MetricsPage = () => {
  const { metrics, loading, error, refetch } = useMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 rounded-full border-4 border-[color:var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          No se pudieron cargar las métricas
        </h2>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <div className="w-32">
          <Button variant="primary" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-dark-primary">Métricas</h1>
        <p className="text-theme-secondary-text mt-1">
          Indicadores de negocio de la plataforma Vision Kit
        </p>
      </div>

      {/* Fila 1 — Revenue & tenants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="MRR"
          value={formatBs(metrics.mrr)}
          variant="success"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="ARR"
          value={formatBs(metrics.arr)}
          variant="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Tenants activos"
          value={metrics.activeTenants}
          variant="info"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="Churn mensual"
          value={formatPct(metrics.churn.churnRatePct)}
          variant="warning"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />
      </div>

      {/* Fila 2 — Activation & trial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Activation rate (7d+)"
          value={formatPct(metrics.activation.ratePct)}
          variant="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatCard
          title="Tenants en trial"
          value={metrics.trialingTenants}
          variant="info"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Detalle activation y churn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
          <h2 className="text-lg font-semibold text-theme-dark-primary mb-4">
            Activación
          </h2>
          <p className="text-sm text-theme-secondary-text mb-4">
            Tenants con antigüedad mayor a 7 días que ya registraron al menos un
            paciente, un producto y una cita.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-theme-secondary-text">Muestra</p>
              <p className="text-2xl font-bold text-theme-dark-primary">
                {metrics.activation.sample}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-theme-secondary-text">Activados</p>
              <p className="text-2xl font-bold text-green-700">
                {metrics.activation.activated}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-theme-secondary-text">Ratio</p>
              <p className="text-2xl font-bold text-theme-primary">
                {formatPct(metrics.activation.ratePct)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
          <h2 className="text-lg font-semibold text-theme-dark-primary mb-4">
            Churn (últimos 30 días)
          </h2>
          <p className="text-sm text-theme-secondary-text mb-4">
            Suscripciones canceladas sobre la base de suscripciones activas y
            canceladas del período.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-theme-secondary-text">Canceladas</p>
              <p className="text-2xl font-bold text-red-700">
                {metrics.churn.cancelledLast30Days}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-theme-secondary-text">Tasa</p>
              <p className="text-2xl font-bold text-yellow-700">
                {formatPct(metrics.churn.churnRatePct)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MRR por plan */}
      <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-theme-dark-primary">
            MRR por plan
          </h2>
          <span className="text-sm text-theme-secondary-text">
            {metrics.activeSubscriptions} suscripción
            {metrics.activeSubscriptions === 1 ? '' : 'es'} en revenue
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow interactive={false}>
              <TableHead>Plan</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead align="right">Suscripciones</TableHead>
              <TableHead align="right">MRR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.mrrByPlan.length === 0 ? (
              <TableEmpty colSpan={4} message="Sin suscripciones activas" />
            ) : (
              metrics.mrrByPlan.map((row) => (
                <TableRow key={row.planSlug} interactive={false}>
                  <TableCell className="font-medium text-theme-dark-primary">
                    {row.planName}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {row.planSlug}
                    </code>
                  </TableCell>
                  <TableCell align="right">{row.count}</TableCell>
                  <TableCell align="right" className="font-bold text-green-700">
                    {formatBs(row.mrrContribution)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Volumen */}
      <div>
        <h2 className="text-lg font-semibold text-theme-dark-primary mb-3">
          Volumen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Pacientes totales"
            value={metrics.totals.patients.toLocaleString('es-BO')}
            variant="default"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatCard
            title="Productos totales"
            value={metrics.totals.products.toLocaleString('es-BO')}
            variant="default"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatCard
            title="Ventas este mes"
            value={metrics.totals.salesThisMonth.toLocaleString('es-BO')}
            variant="success"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
};
