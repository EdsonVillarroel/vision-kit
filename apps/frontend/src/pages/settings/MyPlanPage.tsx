import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useSubscription } from '../../features/subscription';
import type {
  PlanFeatureKey,
  PlanFeatureNumberKey,
  PlanFeatureStringKey,
  QuotaResource,
} from '../../features/subscription';

const featureLabels: Record<PlanFeatureKey, string> = {
  public_portal: 'Portal público de reservas',
  email_reminders: 'Recordatorios por email',
  whatsapp_reminders: 'Recordatorios por WhatsApp',
  digital_prescription_qr: 'Receta digital con QR',
  workshop_module: 'Módulo de taller',
  commissions: 'Comisiones a ópticos',
  basic_reports: 'Reportes básicos',
  advanced_reports: 'Reportes avanzados',
  multi_branch: 'Multi-sucursal',
  stock_transfers: 'Transferencias de stock',
  custom_domain: 'Dominio personalizado',
  sin_invoicing: 'Facturación SIN',
  api_access: 'Acceso a API',
  backup_on_demand: 'Backup bajo demanda',
  branded_portal: 'Portal con branding propio',
};

const numberFeatureLabels: Record<PlanFeatureNumberKey, string> = {
  public_bookings_per_month: 'Reservas públicas por mes',
  whatsapp_included_messages: 'Mensajes WhatsApp incluidos',
  backup_retention_days: 'Retención de backup (días)',
  max_sales_per_month: 'Máximo de ventas por mes',
  max_branches: 'Máximo de sucursales',
};

const stringFeatureLabels: Record<PlanFeatureStringKey, string> = {
  clinical_exams_level: 'Nivel de exámenes clínicos',
  exports: 'Formatos de exportación',
  backup_frequency: 'Frecuencia de backup',
  support_level: 'Nivel de soporte',
  onboarding: 'Onboarding',
};

const FEATURE_KEYS = Object.keys(featureLabels) as PlanFeatureKey[];

const statusLabel: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' }> = {
  active: { label: 'Activa', variant: 'success' },
  trial: { label: 'En prueba', variant: 'info' },
  past_due: { label: 'Pago pendiente', variant: 'warning' },
  cancelled: { label: 'Cancelada', variant: 'error' },
};

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
};

const formatPrice = (price: number, currency: string) => {
  const abbrev = currency === 'BOB' ? 'Bs' : currency;
  return `${abbrev} ${price.toLocaleString('es-BO')}`;
};

const periodLabel = (period: 'monthly' | 'yearly') =>
  period === 'monthly' ? '/ mes' : '/ año';

interface UsageBarProps {
  label: string;
  current: number;
  limit: number;
}

const UsageBar: React.FC<UsageBarProps> = ({ label, current, limit }) => {
  const unlimited = limit === -1;
  const ratio = unlimited || limit === 0 ? 0 : Math.min(1, current / limit);
  const pct = Math.round(ratio * 100);

  // Verde < 0.6, amarillo < 0.9, rojo >= 0.9
  const barColor = unlimited
    ? 'bg-theme-primary'
    : ratio >= 0.9
      ? 'bg-red-500'
      : ratio >= 0.6
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs font-semibold text-gray-600">
          {unlimited ? (
            <>
              {current} <span className="text-gray-400">/ ilimitado</span>
            </>
          ) : (
            <>
              {current} / {limit} <span className="text-gray-400">({pct}%)</span>
            </>
          )}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: unlimited ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const MyPlanPage: React.FC = () => {
  const { data, isLoading, error, hasFeature, getFeatureNumber, getFeatureString } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi plan</h1>
        </div>
        <Card className="text-center py-10">
          <p className="text-gray-600">No se pudo cargar la información de tu plan.</p>
          <p className="text-sm text-gray-400 mt-1">{error ?? 'Intenta recargar la página.'}</p>
        </Card>
      </div>
    );
  }

  const { plan, subscription, limits, usage } = data;
  const expiresAt = formatDate(subscription.expiresAt);
  const status = statusLabel[subscription.status] ?? { label: subscription.status, variant: 'info' as const };

  const resources: Array<{ label: string; resource: QuotaResource; current: number; limit: number }> = [
    { label: 'Pacientes', resource: 'patients', current: usage.patients, limit: limits.patients },
    { label: 'Productos', resource: 'products', current: usage.products, limit: limits.products },
    { label: 'Usuarios', resource: 'users', current: usage.users, limit: limits.users },
    {
      label: 'Ventas este mes',
      resource: 'sales_per_month',
      current: usage.salesThisMonth,
      limit: limits.salesPerMonth,
    },
  ];

  const numberFeatures = (Object.keys(numberFeatureLabels) as PlanFeatureNumberKey[])
    .map((key) => ({ key, value: getFeatureNumber(key) }))
    .filter((f) => f.value !== undefined);

  const stringFeatures = (Object.keys(stringFeatureLabels) as PlanFeatureStringKey[])
    .map((key) => ({ key, value: getFeatureString(key) }))
    .filter((f) => f.value !== undefined && f.value !== '');

  const whatsappUrl = `https://wa.me/59168803830?text=${encodeURIComponent(
    `Hola, quiero mejorar mi plan ${plan.slug} en Vision Kit`,
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi plan</h1>
        <p className="text-gray-600 mt-2">Detalle de tu suscripción y uso actual</p>
      </div>

      {/* Plan card */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-theme-dark-primary">{plan.name}</h2>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(plan.price, plan.currency)}
              </span>
              <span className="text-sm text-gray-500">{periodLabel(plan.billingPeriod)}</span>
            </div>
            {expiresAt && (
              <p className="text-sm text-gray-500 mt-3">
                {subscription.status === 'trial' ? 'Prueba hasta: ' : 'Próxima renovación: '}
                <span className="font-medium text-gray-700">{expiresAt}</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Uso actual */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso actual</h3>
        <div className="space-y-4">
          {resources.map((r) => (
            <UsageBar key={r.resource} label={r.label} current={r.current} limit={r.limit} />
          ))}
        </div>
      </Card>

      {/* Funciones del plan */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Funciones del plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {FEATURE_KEYS.map((key) => {
            const enabled = hasFeature(key);
            return (
              <div key={key} className="flex items-center gap-2.5">
                <span
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {enabled ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </span>
                <span className={`text-sm ${enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                  {featureLabels[key]}
                </span>
              </div>
            );
          })}
        </div>

        {(numberFeatures.length > 0 || stringFeatures.length > 0) && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalles del plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {numberFeatures.map((f) => (
                <div key={f.key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{numberFeatureLabels[f.key]}</span>
                  <span className="font-medium text-gray-900">
                    {f.value === -1 ? 'Ilimitado' : f.value}
                  </span>
                </div>
              ))}
              {stringFeatures.map((f) => (
                <div key={f.key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{stringFeatureLabels[f.key]}</span>
                  <span className="font-medium text-gray-900 capitalize">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row justify-center pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors shadow-md hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Quiero mejorar mi plan
        </a>
      </div>
    </div>
  );
};
