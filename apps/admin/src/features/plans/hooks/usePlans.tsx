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

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const createPlan = async (data: CreatePlanData) => {
    const created = await planService.create(data);
    setPlans(prev => [...prev, created]);
    return created;
  };

  const updatePlan = async (id: string, data: UpdatePlanData) => {
    const updated = await planService.update(id, data);
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    return updated;
  };

  return { plans, loading, error, fetchPlans, createPlan, updatePlan };
};
