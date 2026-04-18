import { api } from '../../../lib/api';
import type { SubscriptionCurrent } from '../types';

export const subscriptionService = {
  getCurrent: () => api.get<SubscriptionCurrent>('/subscriptions/current'),
};
