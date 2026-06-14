import { useCallback, useEffect, useState } from 'react';
import { commissionService } from '../services/commissionService';
import type { CommissionReportRow, UserCommissionSummary } from '../types';

export const useCommissionsReport = (
  from?: string,
  to?: string,
  userId?: string,
) => {
  const [data, setData] = useState<CommissionReportRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await commissionService.getReport({ from, to, userId });
      setData(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar las comisiones',
      );
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [from, to, userId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, isLoading, error, refetch: fetchReport };
};

export const useUserCommissionSummary = (
  userId: string | undefined,
  from?: string,
  to?: string,
) => {
  const [data, setData] = useState<UserCommissionSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!userId) {
      setData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const summary = await commissionService.getUserSummary(userId, { from, to });
      setData(summary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar el resumen del vendedor',
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, from, to]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
};
