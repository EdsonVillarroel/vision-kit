// Valores literales para los campos "enum-like" del JSON features.
// Espejan los strings aceptados por el backend (ver prisma/seedPlans.ts).
export type ClinicalExamsLevel = 'basic' | 'full' | 'full_with_templates';
export type ExportsLevel = 'patients_only' | 'all' | 'all_with_scheduled';
export type BackupFrequency = 'weekly' | 'daily';
export type SupportLevel =
  | 'email_48h'
  | 'email_24h'
  | 'whatsapp_email_8h'
  | 'whatsapp_dedicated_sla_4h';
export type OnboardingLevel =
  | 'self_service'
  | 'video_1h'
  | 'video_2h_plus_migration'
  | 'full_migration_onsite';

export type BillingPeriod = 'monthly' | 'yearly';

// Shape del JSON `features`. Todos los campos son opcionales para tolerar
// planes antiguos con flags incompletos; el editor completa los faltantes
// con defaults al renderizar.
export interface PlanFeatures {
  // Booleans
  public_portal?: boolean;
  email_reminders?: boolean;
  whatsapp_reminders?: boolean;
  digital_prescription_qr?: boolean;
  workshop_module?: boolean;
  commissions?: boolean;
  basic_reports?: boolean;
  advanced_reports?: boolean;
  multi_branch?: boolean;
  stock_transfers?: boolean;
  custom_domain?: boolean;
  sin_invoicing?: boolean;
  api_access?: boolean;
  backup_on_demand?: boolean;
  branded_portal?: boolean;

  // Numbers (-1 = ilimitado)
  public_bookings_per_month?: number;
  whatsapp_included_messages?: number;
  backup_retention_days?: number;
  max_sales_per_month?: number;
  max_branches?: number;

  // Strings (enum-like)
  clinical_exams_level?: ClinicalExamsLevel;
  exports?: ExportsLevel;
  backup_frequency?: BackupFrequency;
  support_level?: SupportLevel;
  onboarding?: OnboardingLevel;

  // Forward compat: permitir flags no mapeadas todavía sin perder datos.
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  maxUsers: number;
  maxPatients: number;
  maxProducts: number;
  maxStorageMb: number;
  features: PlanFeatures;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  _count?: { subscriptions: number };
}

export interface CreatePlanData {
  name: string;
  slug: string;
  price: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  maxUsers: number;
  maxPatients: number;
  maxProducts: number;
  maxStorageMb: number;
  features?: PlanFeatures;
  sortOrder?: number;
}

export interface UpdatePlanData {
  name?: string;
  price?: number;
  billingPeriod?: BillingPeriod;
  currency?: string;
  isActive?: boolean;
  maxUsers?: number;
  maxPatients?: number;
  maxProducts?: number;
  maxStorageMb?: number;
  // IMPORTANTE: el backend hace `prisma.update({ data: dto })` que reemplaza
  // el JSON completo. Por eso cuando enviamos `features` debe ir el objeto
  // entero, no solo los deltas.
  features?: PlanFeatures;
  sortOrder?: number;
}
