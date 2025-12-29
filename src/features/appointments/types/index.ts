export type AppointmentType =
  | 'eye-exam'
  | 'contact-lens-fitting'
  | 'followup'
  | 'emergency'
  | 'frame-selection'
  | 'adjustment';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Appointment {
  id: string;
  appointmentNumber: string;

  // Paciente
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;

  // Fecha y hora
  date: string;
  time: string;
  duration: number; // En minutos
  endTime: string;

  // Tipo y estado
  type: AppointmentType;
  status: AppointmentStatus;

  // Profesional
  practitioner: {
    id: string;
    name: string;
  };

  // Detalles
  reason?: string;
  notes?: string;

  // Recordatorios
  reminderSent?: boolean;
  reminderSentAt?: string;

  // Relacionado
  medicalRecordId?: string; // Si se generó historia clínica

  // Auditoría
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface AppointmentFormData {
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  practitionerId: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  patientId?: string;
  practitionerId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface DaySchedule {
  date: string;
  practitionerId: string;
  slots: TimeSlot[];
}
