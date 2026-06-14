import { useCallback, useEffect, useState } from 'react';
import { metricsService } from '../services/metricsService';
import type { SalesMetrics } from '../types';

export const useSalesMetrics = (from?: string, to?: string) => {
  const [data, setData] = useState<SalesMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await metricsService.getSalesMetrics({ from, to });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
};
