import { SetMetadata } from '@nestjs/common';

export const PLAN_FEATURE_KEY = 'plan_feature';

// Marca un handler (o controller) para que PlanFeatureGuard verifique que el
// flag booleano del plan esté activo. Ej: @PlanFeature('commissions').
export const PlanFeature = (feature: string) =>
  SetMetadata(PLAN_FEATURE_KEY, feature);
