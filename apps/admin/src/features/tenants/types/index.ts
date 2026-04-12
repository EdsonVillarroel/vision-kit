import type { SubscriptionPlan } from '../../plans/types';

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  startedAt: string;
  expiresAt: string | null;
  cancelledAt: string | null;
  paymentNotes: string | null;
  createdAt: string;
  plan?: SubscriptionPlan;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  domain: string | null;
  status: 'active' | 'suspended' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  subscriptions: Subscription[];
  _count: { users: number; patients: number; products?: number; sales?: number };
}

export interface CreateTenantData {
  name: string;
  slug: string;
  planId: string;
  superAdminEmail: string;
  superAdminName: string;
  superAdminPassword: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  domain?: string;
}

export interface UpdateTenantData {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  domain?: string;
}
