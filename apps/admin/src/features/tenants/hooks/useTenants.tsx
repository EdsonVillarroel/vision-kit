import { useCallback, useEffect, useState } from 'react';
import { tenantService } from '../services/tenantService';
import type { CreateTenantData, Tenant, UpdateTenantData } from '../types';

export const useTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const createTenant = async (data: CreateTenantData) => {
    const result = await tenantService.create(data);
    await fetchTenants();
    return result;
  };

  const updateTenant = async (id: string, data: UpdateTenantData) => {
    const updated = await tenantService.update(id, data);
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    return updated;
  };

  const suspendTenant = async (id: string) => {
    await tenantService.suspend(id);
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: 'suspended' as const } : t));
  };

  const activateTenant = async (id: string) => {
    await tenantService.activate(id);
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: 'active' as const } : t));
  };

  return { tenants, loading, error, fetchTenants, createTenant, updateTenant, suspendTenant, activateTenant };
};

export const useTenant = (id: string) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tenantService.getById(id)
      .then(setTenant)
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [id]);

  return { tenant, loading, error };
};
