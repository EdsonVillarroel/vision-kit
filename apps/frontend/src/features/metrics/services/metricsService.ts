import { api } from '../../../lib/api';
import type { SalesMetrics, MetricsQuery } from '../types';

export const metricsService = {
  getSalesMetrics: async (q?: MetricsQuery): Promise<SalesMetrics> => {
    const params = new URLSearchParams();
    if (q?.from) params.set('from', q.from);
    if (q?.to) params.set('to', q.to);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return api.get<SalesMetrics>(`/sales/metrics${qs}`);
  },
};
