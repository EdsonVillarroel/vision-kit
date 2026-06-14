import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  DateRangePresets,
  defaultRange,
  StatsRow,
  SalesByDayChart,
  TopSellersChart,
  PaymentMethodChart,
  useSalesMetrics,
} from '../../features/metrics';
import { Card, Button, SkeletonPageWithStats, Skeleton } from '../../components/ui';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSubscription } from '../../features/subscription';

const ChartSkeletons = () => (
  <div className="space-y-6">
    <Card elevation="low" className="!p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </Card>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card elevation="low" className="!p-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </Card>
      <Card elevation="low" className="!p-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </Card>
    </div>
  </div>
);

export const MetricsPage = () => {
  const { user } = useAuth();
  const { hasFeature } = useSubscription();
  const [range, setRange] = useState<{ from: string; to: string }>(() => defaultRange());
  const { data, isLoading, error, refetch } = useSalesMetrics(range.from, range.to);

  if (user && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasFeature('commissions')) {
    return <Navigate to="/settings/plan" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-theme-dark-primary">Métricas de Ventas</h1>
        <p className="text-theme-secondary-text mt-2">
          Análisis de desempeño de ventas en el rango seleccionado
        </p>
      </div>

      {/* Filtros de rango */}
      <DateRangePresets value={range} onChange={setRange} />

      {/* Contenido */}
      {isLoading && !data ? (
        <>
          <SkeletonPageWithStats statCount={4} tableRows={0} tableCols={0} />
          <ChartSkeletons />
        </>
      ) : error ? (
        <Card elevation="low" className="!p-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-theme-dark-primary mb-2">No se pudieron cargar las métricas</h2>
          <p className="text-theme-secondary-text mb-6">{error}</p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => refetch()}>Reintentar</Button>
          </div>
        </Card>
      ) : data && data.totals.salesCount === 0 ? (
        <>
          <StatsRow totals={data.totals} />
          <Card elevation="low" className="!p-12 text-center">
            <div className="w-14 h-14 bg-theme-light-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3m18 6v-2a4 4 0 00-3-3.87m-3-9a4 4 0 110 7.75M7 7a4 4 0 108 0 4 4 0 00-8 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-theme-dark-primary mb-2">No hay ventas en este rango</h2>
            <p className="text-theme-secondary-text">Probá cambiar el rango de fechas arriba.</p>
          </Card>
        </>
      ) : data ? (
        <>
          <StatsRow totals={data.totals} />
          <SalesByDayChart data={data.byDay} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSellersChart data={data.topSellers} />
            <PaymentMethodChart data={data.byPaymentMethod} />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MetricsPage;
