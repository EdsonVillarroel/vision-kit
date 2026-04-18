// Diccionario único de labels + helpers para cada flag del JSON `features`.
// Lo consume el editor del admin y queda exportado para reutilización futura
// (por ejemplo: mostrar "incluido en tu plan" en la UI del tenant).
//
// Convención:
// - `label`: texto corto para el control (checkbox label, select label).
// - `help`: descripción operativa del flag (una línea).

import type {
  BackupFrequency,
  ClinicalExamsLevel,
  ExportsLevel,
  OnboardingLevel,
  SupportLevel,
} from './types';

export interface FeatureLabel {
  label: string;
  help: string;
}

// ─── Booleans ──────────────────────────────────────────────────────────────
export const booleanFeatureLabels = {
  public_portal: {
    label: 'Portal público',
    help: 'Landing con catálogo y reserva online para el tenant',
  },
  email_reminders: {
    label: 'Recordatorios por email',
    help: 'Envío automático de recordatorios de citas por correo',
  },
  whatsapp_reminders: {
    label: 'Recordatorios por WhatsApp',
    help: 'Envío de recordatorios mediante WhatsApp Business API',
  },
  digital_prescription_qr: {
    label: 'Receta digital con QR',
    help: 'Generar receta en PDF con QR verificable',
  },
  workshop_module: {
    label: 'Módulo taller / montaje',
    help: 'Tracking de órdenes del laboratorio a entrega',
  },
  commissions: {
    label: 'Comisiones de ventas',
    help: 'Cálculo automático de comisiones por vendedor',
  },
  basic_reports: {
    label: 'Reportes básicos',
    help: 'Ventas del día, top productos, pacientes nuevos',
  },
  advanced_reports: {
    label: 'Reportes avanzados',
    help: 'Análisis por rango, por óptico, métricas de retención',
  },
  multi_branch: {
    label: 'Multi-sucursal',
    help: 'Gestión de más de una sucursal dentro del mismo tenant',
  },
  stock_transfers: {
    label: 'Transferencias de stock',
    help: 'Movimientos de inventario entre sucursales',
  },
  custom_domain: {
    label: 'Dominio personalizado',
    help: 'Permite apuntar un dominio propio al portal público',
  },
  sin_invoicing: {
    label: 'Facturación SIN',
    help: 'Integración con Servicio de Impuestos Nacionales (Bolivia)',
  },
  api_access: {
    label: 'Acceso a API',
    help: 'Endpoints REST para integraciones externas',
  },
  backup_on_demand: {
    label: 'Backup bajo demanda',
    help: 'Descarga de respaldo completo solicitada manualmente',
  },
  branded_portal: {
    label: 'Marca Vision Kit en portal',
    help: 'Muestra "Powered by Vision Kit" en el portal público',
  },
} as const satisfies Record<string, FeatureLabel>;

export type BooleanFeatureKey = keyof typeof booleanFeatureLabels;
export const BOOLEAN_FEATURE_KEYS = Object.keys(booleanFeatureLabels) as BooleanFeatureKey[];

// ─── Numbers (cuotas; -1 = ilimitado) ──────────────────────────────────────
export const numberFeatureLabels = {
  public_bookings_per_month: {
    label: 'Reservas públicas por mes',
    help: 'Máximo de bookings que acepta el portal público mensualmente',
  },
  whatsapp_included_messages: {
    label: 'Mensajes WhatsApp incluidos',
    help: 'Cuota mensual de mensajes salientes incluidos en el plan',
  },
  backup_retention_days: {
    label: 'Retención de backups (días)',
    help: 'Cuántos días se conservan los respaldos automáticos',
  },
  max_sales_per_month: {
    label: 'Ventas máximas por mes',
    help: 'Tope mensual de operaciones de venta registradas',
  },
  max_branches: {
    label: 'Sucursales máximas',
    help: 'Número máximo de sucursales activas dentro del tenant',
  },
} as const satisfies Record<string, FeatureLabel>;

export type NumberFeatureKey = keyof typeof numberFeatureLabels;
export const NUMBER_FEATURE_KEYS = Object.keys(numberFeatureLabels) as NumberFeatureKey[];

// ─── Strings (selects enumerados) ──────────────────────────────────────────
export interface SelectOption<V extends string> {
  value: V;
  label: string;
}

export const clinicalExamsLevelOptions: SelectOption<ClinicalExamsLevel>[] = [
  { value: 'basic', label: 'Básico (agudeza visual)' },
  { value: 'full', label: 'Completo (refracción, biomicroscopía)' },
  { value: 'full_with_templates', label: 'Completo + plantillas personalizables' },
];

export const exportsOptions: SelectOption<ExportsLevel>[] = [
  { value: 'patients_only', label: 'Solo pacientes' },
  { value: 'all', label: 'Todos los módulos' },
  { value: 'all_with_scheduled', label: 'Todos + exportaciones programadas' },
];

export const backupFrequencyOptions: SelectOption<BackupFrequency>[] = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'daily', label: 'Diario' },
];

export const supportLevelOptions: SelectOption<SupportLevel>[] = [
  { value: 'email_48h', label: 'Email — 48h' },
  { value: 'email_24h', label: 'Email — 24h' },
  { value: 'whatsapp_email_8h', label: 'WhatsApp + Email — 8h' },
  { value: 'whatsapp_dedicated_sla_4h', label: 'WhatsApp dedicado — SLA 4h' },
];

export const onboardingOptions: SelectOption<OnboardingLevel>[] = [
  { value: 'self_service', label: 'Auto-servicio (docs + video)' },
  { value: 'video_1h', label: 'Videollamada 1 hora' },
  { value: 'video_2h_plus_migration', label: 'Video 2h + migración de datos' },
  { value: 'full_migration_onsite', label: 'Migración completa presencial' },
];

export const selectFeatureLabels = {
  clinical_exams_level: {
    label: 'Nivel de exámenes clínicos',
    help: 'Alcance de los módulos de examen visual habilitados',
  },
  exports: {
    label: 'Exportaciones',
    help: 'Qué módulos y formatos puede exportar el tenant',
  },
  backup_frequency: {
    label: 'Frecuencia de backup',
    help: 'Cada cuánto se ejecuta el respaldo automático',
  },
  support_level: {
    label: 'Nivel de soporte',
    help: 'Canal y SLA de atención al cliente',
  },
  onboarding: {
    label: 'Onboarding',
    help: 'Tipo de acompañamiento en la puesta en marcha',
  },
} as const satisfies Record<string, FeatureLabel>;

export type SelectFeatureKey = keyof typeof selectFeatureLabels;

export const selectFeatureOptions: Record<SelectFeatureKey, SelectOption<string>[]> = {
  clinical_exams_level: clinicalExamsLevelOptions,
  exports: exportsOptions,
  backup_frequency: backupFrequencyOptions,
  support_level: supportLevelOptions,
  onboarding: onboardingOptions,
};

export const SELECT_FEATURE_KEYS = Object.keys(selectFeatureLabels) as SelectFeatureKey[];

// Etiqueta legible en español para cualquier `value` de select.
// Útil para mostrar el valor actual sin tener que buscarlo manualmente.
export function selectFeatureValueLabel(
  key: SelectFeatureKey,
  value: string | undefined,
): string {
  if (!value) return '—';
  const opt = selectFeatureOptions[key].find((o) => o.value === value);
  return opt?.label ?? value;
}
