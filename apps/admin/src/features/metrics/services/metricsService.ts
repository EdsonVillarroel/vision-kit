import { api } from '../../../lib/api';
import type { PlatformMetrics } from '../types';

export const metricsService = {
  getMetrics: () => api.get<PlatformMetrics>('/platform/metrics'),
};
