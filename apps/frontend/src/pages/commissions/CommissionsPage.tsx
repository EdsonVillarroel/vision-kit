import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button, SkeletonPageWithStats } from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useClinicSettings } from '../../features/settings/context/ClinicSettingsContext';
import { useSubscription } from '../../features/subscription';
import {
  CommissionsTable,
  DateRangeFilter,
  exportCommissionsPdf,
  getDefaultRange,
  useCommissionsReport,
} from '../../features/commissions';
import type { DateRange } from '../../features/commissions/types';

export const CommissionsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useClinicSettings();
  const { hasFeature } = useSubscription();
  const { showError, showSuccess } = useSnackbar();
  const [range, setRange] = useState<DateRange>(() => getDefaultRange());
  const [isExporting, setIsExporting] = useState(false);

  const canUseCommissions = hasFeature('commissions');

  const { data, isLoading, error, refetch } = useCommissionsReport(
    range.from,
    range.to,
  );

  if (user && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!canUseCommissions) {
    return <Navigate to="/settings/plan" replace />;
  }

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportCommissionsPdf({
        rows: data,
        from: range.from,
        to: range.to,
        clinicName: settings?.name ?? 'Vision Kit',
        clinicLogo: settings?.logo,
      });
      showSuccess('PDF generado correctamente');
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'No se pudo generar el PDF',
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && data.length === 0 && !error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-dark-primary tracking-tight">
              Comisiones
            </h1>
            <p className="text-theme-secondary-text mt-2">
              Reporte de comisiones por vendedor
            </p>
          </div>
        </div>
        <SkeletonPageWithStats statCount={0} tableRows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-theme-dark-primary">
            Comisiones
          </h1>
          <p className="text-theme-secondary-text mt-2">
            Reporte consultivo de comisiones por vendedor
          </p>
        </div>
        <div className="flex gap-2 md:w-auto">
          <Button
            variant="primary"
            onClick={handleExport}
            isLoading={isExporting}
            disabled={data.length === 0}
            className="!w-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtro de rango */}
      <DateRangeFilter value={range} onChange={setRange} />

      {/* Error */}
      {error && (
        <div className="bg-red-50 ring-1 ring-inset ring-red-600/20 text-red-700 px-4 py-3 rounded-xl animate-fadeIn">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium text-sm">{error}</span>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="shrink-0 px-3 py-1.5 rounded-full bg-red-600/10 hover:bg-red-600/20 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      {isLoading && data.length > 0 ? (
        <div className="relative">
          <CommissionsTable rows={data} />
          <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-theme-primary border-t-transparent"></div>
          </div>
        </div>
      ) : (
        <CommissionsTable rows={data} />
      )}

      {/* Nota consultiva */}
      <p className="text-xs italic text-theme-secondary-text text-center">
        Reporte consultivo basado en ventas completadas al momento de emisión.
        Las ventas que sean reembolsadas después pueden alterar este cálculo.
      </p>
    </div>
  );
};

export default CommissionsPage;
