import { api } from '../../../lib/api';
import type { Appointment, AppointmentFormData, AppointmentFilters, TimeSlot } from '../types';

// ─── Mappers entre valores frontend (hyphen) y backend (underscore) ───────────

type BackendAppointmentType =
  | 'eye_exam'
  | 'contact_lens_fitting'
  | 'followup'
  | 'emergency'
  | 'frame_selection'
  | 'adjustment';

type BackendAppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

const TYPE_TO_FRONTEND: Record<BackendAppointmentType, Appointment['type']> = {
  eye_exam: 'eye-exam',
  contact_lens_fitting: 'contact-lens-fitting',
  followup: 'followup',
  emergency: 'emergency',
  frame_selection: 'frame-selection',
  adjustment: 'adjustment',
};

const TYPE_TO_BACKEND: Record<Appointment['type'], BackendAppointmentType> = {
  'eye-exam': 'eye_exam',
  'contact-lens-fitting': 'contact_lens_fitting',
  followup: 'followup',
  emergency: 'emergency',
  'frame-selection': 'frame_selection',
  adjustment: 'adjustment',
};

const STATUS_TO_FRONTEND: Record<BackendAppointmentStatus, Appointment['status']> = {
  scheduled: 'scheduled',
  confirmed: 'confirmed',
  in_progress: 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no-show',
};

const STATUS_TO_BACKEND: Record<Appointment['status'], BackendAppointmentStatus> = {
  scheduled: 'scheduled',
  confirmed: 'confirmed',
  'in-progress': 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  'no-show': 'no_show',
};

// El backend retorna un objeto plano con practitionerId/patientId; el frontend espera objetos anidados
interface BackendAppointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  practitionerId: string;
  date: string;
  time: string;
  duration: number;
  endTime: string;
  type: BackendAppointmentType;
  status: BackendAppointmentStatus;
  reason?: string;
  notes?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  medicalRecordId?: string;
  createdById: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  // relaciones incluidas
  patient?: { id: string; firstName: string; lastName: string; phone: string; email?: string };
  practitioner?: { id: string; name: string };
  createdBy?: { id: string; name: string };
}

function mapAppointment(b: BackendAppointment): Appointment {
  return {
    id: b.id,
    appointmentNumber: b.appointmentNumber,
    patientId: b.patientId,
    patientName: b.patient ? `${b.patient.firstName} ${b.patient.lastName}` : '',
    patientPhone: b.patient?.phone ?? '',
    patientEmail: b.patient?.email,
    date: b.date.split('T')[0],
    time: b.time,
    duration: b.duration,
    endTime: b.endTime,
    type: TYPE_TO_FRONTEND[b.type] ?? (b.type as Appointment['type']),
    status: STATUS_TO_FRONTEND[b.status] ?? (b.status as Appointment['status']),
    practitioner: b.practitioner ?? { id: b.practitionerId, name: '' },
    reason: b.reason,
    notes: b.notes,
    reminderSent: b.reminderSent,
    reminderSentAt: b.reminderSentAt,
    medicalRecordId: b.medicalRecordId,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    createdBy: b.createdBy ?? { id: b.createdById, name: '' },
    confirmedAt: b.confirmedAt,
    completedAt: b.completedAt,
    cancelledAt: b.cancelledAt,
    cancellationReason: b.cancellationReason,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const appointmentService = {
  getAll: async (filters?: AppointmentFilters): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.status) params.set('status', STATUS_TO_BACKEND[filters.status]);
    if (filters?.practitionerId) params.set('practitionerId', filters.practitionerId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await api.get<BackendAppointment[]>(`/appointments${qs}`);
    return data.map(mapAppointment);
  },

  getById: async (id: string): Promise<Appointment | null> => {
    try {
      const data = await api.get<BackendAppointment>(`/appointments/${id}`);
      return mapAppointment(data);
    } catch {
      return null;
    }
  },

  getByDate: async (date: string, practitionerId?: string): Promise<Appointment[]> => {
    return appointmentService.getAll({ date, practitionerId });
  },

  getByPatientId: async (patientId: string): Promise<Appointment[]> => {
    const all = await appointmentService.getAll();
    return all
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  },

  getUpcoming: async (limit?: number): Promise<Appointment[]> => {
    const today = new Date().toISOString().split('T')[0];
    const all = await appointmentService.getAll();
    const upcoming = all
      .filter(
        (a) =>
          a.date >= today && (a.status === 'scheduled' || a.status === 'confirmed')
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    return limit ? upcoming.slice(0, limit) : upcoming;
  },

  getAvailableSlots: async (
    date: string,
    practitionerId: string,
    _duration: number = 30
  ): Promise<TimeSlot[]> => {
    const qs = `?date=${date}&practitionerId=${practitionerId}`;
    return api.get<TimeSlot[]>(`/appointments/slots${qs}`);
  },

  create: async (data: AppointmentFormData): Promise<Appointment> => {
    const payload = {
      patientId: data.patientId,
      practitionerId: data.practitionerId,
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: TYPE_TO_BACKEND[data.type],
      reason: data.reason,
      notes: data.notes,
    };
    const result = await api.post<BackendAppointment>('/appointments', payload);
    return mapAppointment(result);
  },

  update: async (id: string, data: Partial<AppointmentFormData>): Promise<Appointment> => {
    const payload: Record<string, unknown> = { ...data };
    if (data.type) payload.type = TYPE_TO_BACKEND[data.type];
    const result = await api.patch<BackendAppointment>(`/appointments/${id}`, payload);
    return mapAppointment(result);
  },

  updateStatus: async (
    id: string,
    status: Appointment['status'],
    cancellationReason?: string
  ): Promise<Appointment> => {
    const payload: Record<string, unknown> = { status: STATUS_TO_BACKEND[status] };
    if (status === 'cancelled' && cancellationReason) {
      payload.cancellationReason = cancellationReason;
    }
    const result = await api.patch<BackendAppointment>(`/appointments/${id}`, payload);
    return mapAppointment(result);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/appointments/${id}`);
  },
};
