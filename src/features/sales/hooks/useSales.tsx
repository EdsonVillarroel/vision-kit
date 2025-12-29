import { useState, useEffect, useCallback } from 'react';
import { salesService } from '../services/salesService';
import type { Sale, SaleFormData } from '../types';
import { useSnackbar } from '../../../components/Snackbar';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getAll();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const createSale = async (data: SaleFormData) => {
    setError(null);
    try {
      const newSale = await salesService.create(data);
      setSales(prev => [newSale, ...prev]);
      showSuccess('Venta registrada exitosamente');
      return newSale;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear venta';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const cancelSale = async (id: string, reason: string) => {
    setError(null);
    try {
      const updated = await salesService.cancel(id, reason);
      setSales(prev => prev.map(s => s.id === id ? updated : s));
      showSuccess('Venta cancelada exitosamente');
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar venta';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const refundSale = async (id: string, reason: string) => {
    setError(null);
    try {
      const updated = await salesService.refund(id, reason);
      setSales(prev => prev.map(s => s.id === id ? updated : s));
      showSuccess('Reembolso procesado exitosamente');
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar reembolso';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const getSalesByPatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getByPatientId(patientId);
      setSales(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas del paciente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    cancelSale,
    refundSale,
    getSalesByPatient
  };
};

export const useSale = (id: string) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await salesService.getById(id);
        setSale(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar venta');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSale();
    }
  }, [id]);

  return { sale, loading, error };
};

export const useSalesSummary = (dateFrom?: string, dateTo?: string) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getSummary(dateFrom, dateTo);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resumen');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, fetchSummary };
};
