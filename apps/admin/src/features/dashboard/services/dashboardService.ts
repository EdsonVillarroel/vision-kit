import { api } from '../../../lib/api';
import type { PlatformStats } from '../types';

export const dashboardService = {
  getStats: () => api.get<PlatformStats>('/platform/stats'),
};
