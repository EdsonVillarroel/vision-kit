import { useCallback, useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionWithRelations, UpdateSubscriptionData } from '../types';

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.getAll();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const updateSubscription = async (id: string, data: UpdateSubscriptionData) => {
    const updated = await subscriptionService.update(id, data);
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    return updated;
  };

  return { subscriptions, loading, error, fetchSubscriptions, updateSubscription };
};
