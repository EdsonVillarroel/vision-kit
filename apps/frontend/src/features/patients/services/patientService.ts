import { api } from '../../../lib/api';
import type { Patient, PatientFormData } from '../types';

export const patientService = {
  getAll: async (search?: string): Promise<Patient[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<Patient[]>(`/patients${query}`);
  },

  getById: async (id: string): Promise<Patient | null> => {
    try {
      return await api.get<Patient>(`/patients/${id}`);
    } catch {
      return null;
    }
  },

  search: async (query: string): Promise<Patient[]> => {
    return api.get<Patient[]>(`/patients?search=${encodeURIComponent(query)}`);
  },

  searchByIdentificationId: async (identificationId: string): Promise<Patient | null> => {
    const results = await api.get<Patient[]>(
      `/patients?search=${encodeURIComponent(identificationId)}`
    );
    return results.find((p) => p.identificationId === identificationId) ?? null;
  },

  create: async (data: PatientFormData): Promise<Patient> => {
    return api.post<Patient>('/patients', data);
  },

  update: async (id: string, data: Partial<PatientFormData>): Promise<Patient> => {
    return api.patch<Patient>(`/patients/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/patients/${id}`);
  },

  updateStatus: async (
    id: string,
    status: 'frequent' | 'warning' | 'normal',
    warningReason?: string
  ): Promise<Patient> => {
    return api.patch<Patient>(`/patients/${id}`, { status, warningReason });
  },

  getMedicalRecords: async (id: string): Promise<unknown[]> => {
    return api.get<unknown[]>(`/patients/${id}/medical-records`);
  },

  getSales: async (id: string): Promise<unknown[]> => {
    return api.get<unknown[]>(`/patients/${id}/sales`);
  },
};
