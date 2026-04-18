import { useCallback, useEffect, useState } from 'react';
import { planService } from '../services/planService';
import type { CreatePlanData, SubscriptionPlan, UpdatePlanData } from '../types';

export const usePlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await planService.getAll();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = async (data: CreatePlanData) => {
    const created = await planService.create(data);
    setPlans((prev) => [...prev, created]);
    return created;
  };

  const updatePlan = async (id: string, data: UpdatePlanData) => {
    const updated = await planService.update(id, data);
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    return updated;
  };

  const togglePlanActive = async (id: string, isActive: boolean) => {
    return updatePlan(id, { isActive });
  };

  return { plans, loading, error, fetchPlans, createPlan, updatePlan, togglePlanActive };
};

// Hook para cargar un plan puntual (usado por el editor).
// Se apoya en `planService.getById` que actualmente deriva de la lista.
export const usePlan = (id: string | undefined) => {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    planService
      .getById(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) setError('Plan no encontrado');
        setPlan(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar el plan');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { plan, loading, error };
};
