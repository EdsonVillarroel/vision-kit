export interface PlatformStats {
  tenants: {
    total: number;
    active: number;
    suspended: number;
    cancelled: number;
    newThisMonth: number;
  };
  subscriptions: {
    active: number;
    mrr: number;
    currency: string;
  };
  users: { total: number };
  patients: { total: number };
}
