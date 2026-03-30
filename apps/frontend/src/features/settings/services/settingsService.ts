import { api } from '../../../lib/api';

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export type BusinessHours = Record<string, DaySchedule>;

export interface ClinicSettings {
  id: string;
  name: string;
  rfc?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  taxRate?: number;
  currency?: string;
  businessHours?: BusinessHours;
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday:    { open: '09:00', close: '19:00', closed: false },
  tuesday:   { open: '09:00', close: '19:00', closed: false },
  wednesday: { open: '09:00', close: '19:00', closed: false },
  thursday:  { open: '09:00', close: '19:00', closed: false },
  friday:    { open: '09:00', close: '19:00', closed: false },
  saturday:  { open: '09:00', close: '14:00', closed: false },
  sunday:    { open: '09:00', close: '14:00', closed: true  },
};

export const settingsService = {
  get: (): Promise<ClinicSettings> => api.get<ClinicSettings>('/settings'),

  update: (data: Partial<ClinicSettings>): Promise<ClinicSettings> =>
    api.patch<ClinicSettings>('/settings', data),
};
