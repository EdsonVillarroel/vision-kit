export interface PlatformMetricsPlanRow {
  planSlug: string;
  planName: string;
  count: number;
  mrrContribution: number;
}

export interface PlatformMetrics {
  mrr: number;
  arr: number;
  activeTenants: number;
  activeSubscriptions: number;
  trialingTenants: number;
  mrrByPlan: PlatformMetricsPlanRow[];
  churn: {
    cancelledLast30Days: number;
    churnRatePct: number;
  };
  activation: {
    sample: number;
    activated: number;
    ratePct: number;
  };
  totals: {
    patients: number;
    products: number;
    salesThisMonth: number;
  };
}
