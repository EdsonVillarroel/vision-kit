export interface SubscriptionWithRelations {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  startedAt: string;
  expiresAt: string | null;
  cancelledAt: string | null;
  paymentNotes: string | null;
  createdAt: string;
  tenant: { id: string; name: string; slug: string; status: string };
  plan: { id: string; name: string; price: number; currency: string };
}

export interface UpdateSubscriptionData {
  planId?: string;
  status?: 'active' | 'past_due' | 'cancelled' | 'trial';
  expiresAt?: string;
  paymentNotes?: string;
}
