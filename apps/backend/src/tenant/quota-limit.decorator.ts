import { SetMetadata } from '@nestjs/common';

export const QUOTA_METADATA_KEY = 'quotaResource';

export type QuotaResource = 'patients' | 'products' | 'users' | 'sales_per_month';

// Marca un handler para que PlanQuotaGuard verifique el recurso antes de crear.
// Ej: @QuotaLimit('patients')
export const QuotaLimit = (resource: QuotaResource) =>
  SetMetadata(QUOTA_METADATA_KEY, resource);
