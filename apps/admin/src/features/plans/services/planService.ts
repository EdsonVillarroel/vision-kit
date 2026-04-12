import { api } from '../../../lib/api';
import type { CreatePlanData, SubscriptionPlan, UpdatePlanData } from '../types';

export const planService = {
  getAll: () => api.get<SubscriptionPlan[]>('/platform/plans'),

  create: (data: CreatePlanData) => api.post<SubscriptionPlan>('/platform/plans', data),

  update: (id: string, data: UpdatePlanData) =>
    api.patch<SubscriptionPlan>(`/platform/plans/${id}`, data),
};
