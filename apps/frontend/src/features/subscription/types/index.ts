// Claves de features del plan. Alineadas con prisma/seedPlans.ts.
// `-1` = ilimitado en cualquier campo numérico.
export type PlanFeatureKey =
  | 'public_portal'
  | 'email_reminders'
  | 'whatsapp_reminders'
  | 'digital_prescription_qr'
  | 'workshop_module'
  | 'commissions'
  | 'basic_reports'
  | 'advanced_reports'
  | 'multi_branch'
  | 'stock_transfers'
  | 'custom_domain'
  | 'sin_invoicing'
  | 'api_access'
  | 'backup_on_demand'
  | 'branded_portal';

export type PlanFeatureNumberKey =
  | 'public_bookings_per_month'
  | 'whatsapp_included_messages'
  | 'backup_retention_days'
  | 'max_sales_per_month'
  | 'max_branches';

export type PlanFeatureStringKey =
  | 'clinical_exams_level'
  | 'exports'
  | 'backup_frequency'
  | 'support_level'
  | 'onboarding';

export type PlanFeatures = Partial<
  Record<PlanFeatureKey, boolean> &
    Record<PlanFeatureNumberKey, number> &
    Record<PlanFeatureStringKey, string>
>;

export interface SubscriptionSummary {
  id: string;
  status: 'active' | 'trial' | 'past_due' | 'cancelled';
  startedAt: string;
  expiresAt: string | null;
}

export interface PlanSummary {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: PlanFeatures;
}

export interface PlanLimits {
  patients: number;
  products: number;
  users: number;
  storageMb: number;
  salesPerMonth: number;
}

export interface PlanUsage {
  patients: number;
  products: number;
  users: number;
  salesThisMonth: number;
}

export interface SubscriptionCurrent {
  subscription: SubscriptionSummary;
  plan: PlanSummary;
  limits: PlanLimits;
  usage: PlanUsage;
}

export type QuotaResource = 'patients' | 'products' | 'users' | 'sales_per_month';

export interface QuotaExceededError {
  statusCode: 402;
  error: 'PlanQuotaExceeded';
  resource: QuotaResource;
  current: number;
  limit: number;
  planSlug: string;
  planName: string;
  message: string;
}
