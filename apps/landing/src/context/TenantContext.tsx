import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { publicApi } from '../lib/api';
import type { ClinicInfo } from '../types';

const DEFAULT_BRAND = '#c17d2a';
const DEFAULT_SLUG  = 'vision-2020-hd';

interface TenantContextType {
  tenantSlug: string;
  clinicInfo: ClinicInfo | null;
  brandColor: string;
  isLoading: boolean;
  /** Build a path scoped to the current tenant. E.g. path('catalogo') → '/vision-2020-hd/catalogo' */
  path: (route?: string) => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTenant = (): TenantContextType => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantLayout');
  return ctx;
};

export function TenantLayout() {
  const { tenantSlug = DEFAULT_SLUG } = useParams<{ tenantSlug: string }>();
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    publicApi
      .getClinicInfo(tenantSlug)
      .then((info) => {
        if (cancelled) return;
        setClinicInfo(info);
        const brand = info.primaryColor ?? DEFAULT_BRAND;
        document.documentElement.style.setProperty('--brand', brand);
      })
      .catch(() => {
        if (!cancelled) setClinicInfo(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [tenantSlug]);

  const brandColor = clinicInfo?.primaryColor ?? DEFAULT_BRAND;

  const path = (route = '') => {
    const clean = route ? (route.startsWith('/') ? route : `/${route}`) : '';
    return `/${tenantSlug}${clean}`;
  };

  return (
    <TenantContext.Provider value={{ tenantSlug, clinicInfo, brandColor, isLoading, path }}>
      <Outlet />
    </TenantContext.Provider>
  );
}
