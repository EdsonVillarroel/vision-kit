import { api } from '../../../lib/api';
import type { SubscriptionWithRelations, UpdateSubscriptionData } from '../types';

export const subscriptionService = {
  getAll: () => api.get<SubscriptionWithRelations[]>('/platform/subscriptions'),

  update: (id: string, data: UpdateSubscriptionData) =>
    api.patch<SubscriptionWithRelations>(`/platform/subscriptions/${id}`, data),
};
