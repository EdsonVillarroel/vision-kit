import { api } from '../../../lib/api';
import type { CreateTenantData, Tenant, UpdateTenantData } from '../types';

export const tenantService = {
  getAll: () => api.get<Tenant[]>('/platform/tenants'),

  getById: (id: string) => api.get<Tenant>(`/platform/tenants/${id}`),

  create: (data: CreateTenantData) => api.post<{ tenant: Tenant }>('/platform/tenants', data),

  update: (id: string, data: UpdateTenantData) =>
    api.patch<Tenant>(`/platform/tenants/${id}`, data),

  suspend: (id: string) => api.patch<Tenant>(`/platform/tenants/${id}/suspend`),

  activate: (id: string) => api.patch<Tenant>(`/platform/tenants/${id}/activate`),
};
