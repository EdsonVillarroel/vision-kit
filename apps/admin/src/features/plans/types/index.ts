export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingPeriod: string;
  maxUsers: number | null;
  maxPatients: number | null;
  maxProducts: number | null;
  maxStorageMb: number | null;
  features: Record<string, unknown>;
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
  billingPeriod?: string;
  maxUsers?: number;
  maxPatients?: number;
  maxProducts?: number;
  maxStorageMb?: number;
  features?: Record<string, unknown>;
  sortOrder?: number;
}

export interface UpdatePlanData {
  name?: string;
  price?: number;
  isActive?: boolean;
  maxUsers?: number;
  maxPatients?: number;
  maxProducts?: number;
  maxStorageMb?: number;
  sortOrder?: number;
}
