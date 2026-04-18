import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../../features/plans';
import type { SubscriptionPlan } from '../../features/plans';
import {
  Badge,
  SkeletonPageWithStats,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';

// Formateo de montos en Bolivianos con separador es-BO.
const priceFmt = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// `-1` = ilimitado en la DB; lo renderizamos como ∞ en la UI.
const limitLabel = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '∞';
  if (value === -1) return '∞';
  return value.toLocaleString('es-BO');
};

const periodLabel = (period: string): string =>
  period === 'yearly' ? 'Anual' : 'Mensual';

export const PlansPage = () => {
  const navigate = useNavigate();
  const { plans, loading, error, togglePlanActive } = usePlans();
  const { showSnackbar } = useSnackbar();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.sortOrder - b.sortOrder),
    [plans],
  );

  if (loading && plans.length === 0) {
    return <SkeletonPageWithStats statCount={3} tableRows={7} tableCols={8} />;
  }
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const activePlans = plans.filter((p) => p.isActive).length;
  const totalSubs = plans.reduce((s, p) => s + (p._count?.subscriptions ?? 0), 0);
  const freePlans = plans.filter((p) => Number(p.price) === 0).length;

  const handleToggle = async (plan: SubscriptionPlan) => {
    setTogglingId(plan.id);
    try {
      await togglePlanActive(plan.id, !plan.isActive);
      showSnackbar(
        plan.isActive ? 'Plan desactivado' : 'Plan activado',
        'success',
      );
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-dark-primary">
            Planes de Suscripción
          </h1>
          <p className="text-theme-secondary-text mt-1">
            {plans.length} plan{plans.length !== 1 ? 'es' : ''} configurado
            {plans.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Planes activos" value={activePlans} variant="success" />
        <StatCard title="Planes gratuitos" value={freePlans} variant="primary" />
        <StatCard title="Suscripciones totales" value={totalSubs} variant="default" />
      </div>

      {/* Tabla de planes */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Slug</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead align="right">Precio</TableHead>
            <TableHead align="center">Ciclo</TableHead>
            <TableHead align="center">Usuarios</TableHead>
            <TableHead align="center">Pacientes</TableHead>
            <TableHead align="center">Productos</TableHead>
            <TableHead align="center">Activo</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {sortedPlans.length === 0 ? (
            <TableEmpty colSpan={9} message="No hay planes configurados" />
          ) : (
            sortedPlans.map((plan) => {
              const isFree = Number(plan.price) === 0;
              const isYearly = plan.billingPeriod === 'yearly';
              const isToggling = togglingId === plan.id;
              return (
                <TableRow key={plan.id} interactive={false}>
                  <TableCell>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {plan.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-theme-dark-primary">
                      {plan.name}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      {isFree ? (
                        <Badge variant="success" size="sm">GRATIS</Badge>
                      ) : (
                        <span className="font-semibold text-theme-primary">
                          Bs {priceFmt.format(Number(plan.price))}
                        </span>
                      )}
                      {isYearly && !isFree && (
                        <Badge variant="primary" size="sm">-20%</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Badge
                      variant={isYearly ? 'info' : 'default'}
                      size="sm"
                    >
                      {periodLabel(plan.billingPeriod)}
                    </Badge>
                  </TableCell>
                  <TableCell align="center">{limitLabel(plan.maxUsers)}</TableCell>
                  <TableCell align="center">{limitLabel(plan.maxPatients)}</TableCell>
                  <TableCell align="center">{limitLabel(plan.maxProducts)}</TableCell>
                  <TableCell align="center">
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggle(plan)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 disabled:opacity-50 ${
                        plan.isActive ? 'bg-theme-primary' : 'bg-gray-300'
                      }`}
                      aria-label={plan.isActive ? 'Desactivar plan' : 'Activar plan'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          plan.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell align="right">
                    <button
                      onClick={() => navigate(`/plans/${plan.id}/edit`)}
                      className="text-xs px-3 py-1.5 border border-theme-primary/30 text-theme-primary rounded-lg hover:bg-theme-light-primary transition-colors"
                    >
                      Editar
                    </button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
