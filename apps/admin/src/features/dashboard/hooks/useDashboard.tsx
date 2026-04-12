import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { PlatformStats } from '../types';

export const useDashboard = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
};
