import { api } from '../../../lib/api';
import type { CreatePlanData, SubscriptionPlan, UpdatePlanData } from '../types';

export const planService = {
  getAll: () => api.get<SubscriptionPlan[]>('/platform/plans'),

  // El backend actual no expone GET /platform/plans/:id. Mientras tanto,
  // derivamos el plan desde la lista completa (son pocos ítems — 7 planes).
  getById: async (id: string): Promise<SubscriptionPlan | null> => {
    const all = await api.get<SubscriptionPlan[]>('/platform/plans');
    return all.find((p) => p.id === id) ?? null;
  },

  create: (data: CreatePlanData) => api.post<SubscriptionPlan>('/platform/plans', data),

  update: (id: string, data: UpdatePlanData) =>
    api.patch<SubscriptionPlan>(`/platform/plans/${id}`, data),
};
