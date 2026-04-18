import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type {
  PlanFeatureKey,
  PlanFeatureNumberKey,
  PlanFeatureStringKey,
  QuotaResource,
  SubscriptionCurrent,
} from '../types';

const UNLIMITED = -1;

interface SubscriptionContextType {
  data: SubscriptionCurrent | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  hasFeature: (key: PlanFeatureKey) => boolean;
  getFeatureNumber: (key: PlanFeatureNumberKey) => number | undefined;
  getFeatureString: (key: PlanFeatureStringKey) => string | undefined;

  isOverQuota: (resource: QuotaResource) => boolean;
  isNearQuota: (resource: QuotaResource, threshold?: number) => boolean;
  usageRatio: (resource: QuotaResource) => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{
  children: ReactNode;
  enabled?: boolean;
}> = ({ children, enabled = true }) => {
  const [data, setData] = useState<SubscriptionCurrent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await subscriptionService.getCurrent();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la suscripción');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    fetch();
  }, [enabled, fetch]);

  const value = useMemo<SubscriptionContextType>(() => {
    const features = data?.plan.features ?? {};

    const hasFeature = (key: PlanFeatureKey) => Boolean(features[key]);
    const getFeatureNumber = (key: PlanFeatureNumberKey) => features[key];
    const getFeatureString = (key: PlanFeatureStringKey) => features[key];

    const limitFor = (resource: QuotaResource): number => {
      if (!data) return UNLIMITED;
      switch (resource) {
        case 'patients':
          return data.limits.patients;
        case 'products':
          return data.limits.products;
        case 'users':
          return data.limits.users;
        case 'sales_per_month':
          return data.limits.salesPerMonth;
      }
    };

    const usageFor = (resource: QuotaResource): number => {
      if (!data) return 0;
      switch (resource) {
        case 'patients':
          return data.usage.patients;
        case 'products':
          return data.usage.products;
        case 'users':
          return data.usage.users;
        case 'sales_per_month':
          return data.usage.salesThisMonth;
      }
    };

    const usageRatio = (resource: QuotaResource) => {
      const limit = limitFor(resource);
      if (limit === UNLIMITED || limit === 0) return 0;
      return usageFor(resource) / limit;
    };

    const isOverQuota = (resource: QuotaResource) => {
      const limit = limitFor(resource);
      if (limit === UNLIMITED) return false;
      return usageFor(resource) >= limit;
    };

    const isNearQuota = (resource: QuotaResource, threshold = 0.8) => {
      const limit = limitFor(resource);
      if (limit === UNLIMITED) return false;
      return usageFor(resource) / limit >= threshold;
    };

    return {
      data,
      isLoading,
      error,
      refresh: fetch,
      hasFeature,
      getFeatureNumber,
      getFeatureString,
      isOverQuota,
      isNearQuota,
      usageRatio,
    };
  }, [data, isLoading, error, fetch]);

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSubscription = (): SubscriptionContextType => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return ctx;
};
