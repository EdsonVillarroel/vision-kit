import type { Appointment, AppointmentFormData, TimeSlot } from '../types';

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT001',
    appointmentNumber: 'CITA-2024-001',
    patientId: '1',
    patientName: 'Juan Pérez',
    patientPhone: '555-0101',
    patientEmail: 'juan.perez@email.com',
    date: '2024-12-05',
    time: '10:00',
    duration: 45,
    endTime: '10:45',
    type: 'eye-exam',
    status: 'scheduled',
    practitioner: {
      id: 'OPT001',
      name: 'Dr. Carlos Ramírez'
    },
    reason: 'Examen de rutina anual',
    notes: 'Paciente prefiere lentes sin armazón',
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
    createdBy: {
      id: 'USR001',
      name: 'Recepcionista 1'
    }
  },
  {
    id: 'APT002',
    appointmentNumber: 'CITA-2024-002',
    patientId: '2',
    patientName: 'Ana García',
    patientPhone: '555-0201',
    patientEmail: 'ana.garcia@email.com',
    date: '2024-12-05',
    time: '11:00',
    duration: 30,
    endTime: '11:30',
    type: 'frame-selection',
    status: 'confirmed',
    practitioner: {
      id: 'OPT002',
      name: 'Dra. María González'
    },
    reason: 'Selección de armazón para nueva prescripción',
    reminderSent: true,
    reminderSentAt: '2024-12-04T09:00:00Z',
    createdAt: '2024-12-02T14:00:00Z',
    updatedAt: '2024-12-03T10:00:00Z',
    confirmedAt: '2024-12-03T10:00:00Z',
    createdBy: {
      id: 'USR001',
      name: 'Recepcionista 1'
    }
  },
  {
    id: 'APT003',
    appointmentNumber: 'CITA-2024-003',
    patientId: '3',
    patientName: 'Roberto Martínez',
    patientPhone: '555-0301',
    date: '2024-12-06',
    time: '09:00',
    duration: 60,
    endTime: '10:00',
    type: 'contact-lens-fitting',
    status: 'scheduled',
    practitioner: {
      id: 'OPT001',
      name: 'Dr. Carlos Ramírez'
    },
    reason: 'Primera adaptación de lentes de contacto',
    notes: 'Paciente nunca ha usado lentes de contacto, requerirá instrucciones detalladas',
    createdAt: '2024-12-02T16:00:00Z',
    updatedAt: '2024-12-02T16:00:00Z',
    createdBy: {
      id: 'USR002',
      name: 'Recepcionista 2'
    }
  },
  {
    id: 'APT004',
    appointmentNumber: 'CITA-2024-004',
    patientId: '1',
    patientName: 'Juan Pérez',
    patientPhone: '555-0101',
    patientEmail: 'juan.perez@email.com',
    date: '2024-11-20',
    time: '10:00',
    duration: 45,
    endTime: '10:45',
    type: 'eye-exam',
    status: 'completed',
    practitioner: {
      id: 'OPT001',
      name: 'Dr. Carlos Ramírez'
    },
    reason: 'Examen de rutina',
    medicalRecordId: 'MR001',
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-11-20T10:50:00Z',
    completedAt: '2024-11-20T10:50:00Z',
    createdBy: {
      id: 'USR001',
      name: 'Recepcionista 1'
    }
  }
];

let appointments = [...MOCK_APPOINTMENTS];
let appointmentCounter = 5;

// Horarios de trabajo (9:00 AM - 6:00 PM)
const WORKING_HOURS = {
  start: '09:00',
  end: '18:00',
  slotDuration: 30 // minutos por slot
};

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sorted = [...appointments].sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        });
        resolve(sorted);
      }, 500);
    });
  },

  getById: async (id: string): Promise<Appointment | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === id);
        resolve(appointment || null);
      }, 300);
    });
  },

  getByPatientId: async (patientId: string): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patientAppointments = appointments
          .filter(a => a.patientId === patientId)
          .sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.time.localeCompare(a.time);
          });
        resolve(patientAppointments);
      }, 400);
    });
  },

  getByDate: async (date: string, practitionerId?: string): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = appointments.filter(a => a.date === date);
        if (practitionerId) {
          filtered = filtered.filter(a => a.practitioner.id === practitionerId);
        }
        const sorted = filtered.sort((a, b) => a.time.localeCompare(b.time));
        resolve(sorted);
      }, 400);
    });
  },

  getUpcoming: async (limit?: number): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = appointments
          .filter(a =>
            a.date >= today &&
            (a.status === 'scheduled' || a.status === 'confirmed')
          )
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
          });

        resolve(limit ? upcoming.slice(0, limit) : upcoming);
      }, 400);
    });
  },

  getAvailableSlots: async (
    date: string,
    practitionerId: string,
    duration: number = 30
  ): Promise<TimeSlot[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dayAppointments = appointments.filter(
          a => a.date === date &&
               a.practitioner.id === practitionerId &&
               a.status !== 'cancelled' &&
               a.status !== 'no-show'
        );

        const slots: TimeSlot[] = [];
        const [startHour, startMin] = WORKING_HOURS.start.split(':').map(Number);
        const [endHour, endMin] = WORKING_HOURS.end.split(':').map(Number);

        let currentHour = startHour;
        let currentMin = startMin;

        while (
          currentHour < endHour ||
          (currentHour === endHour && currentMin < endMin)
        ) {
          const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

          // Verificar si hay conflicto con citas existentes
          const hasConflict = dayAppointments.some(apt => {
            return timeStr >= apt.time && timeStr < apt.endTime;
          });

          const conflictingAppointment = dayAppointments.find(apt =>
            timeStr >= apt.time && timeStr < apt.endTime
          );

          slots.push({
            time: timeStr,
            available: !hasConflict,
            appointmentId: conflictingAppointment?.id
          });

          // Avanzar al siguiente slot
          currentMin += WORKING_HOURS.slotDuration;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
        }

        resolve(slots);
      }, 400);
    });
  },

  create: async (data: AppointmentFormData, createdBy: { id: string; name: string }): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Verificar disponibilidad
        const slots = await appointmentService.getAvailableSlots(
          data.date,
          data.practitionerId,
          data.duration
        );

        const requestedSlot = slots.find(s => s.time === data.time);
        if (!requestedSlot || !requestedSlot.available) {
          reject(new Error('El horario seleccionado no está disponible'));
          return;
        }

        // Calcular endTime
        const [hours, minutes] = data.time.split(':').map(Number);
        const endMinutes = (hours * 60 + minutes + data.duration);
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

        const newAppointment: Appointment = {
          id: `APT${Date.now()}`,
          appointmentNumber: `CITA-2024-${String(appointmentCounter++).padStart(3, '0')}`,
          patientId: data.patientId,
          patientName: 'Paciente', // En producción, buscar del servicio de pacientes
          patientPhone: '555-0000',
          date: data.date,
          time: data.time,
          duration: data.duration,
          endTime,
          type: data.type,
          status: 'scheduled',
          practitioner: {
            id: data.practitionerId,
            name: 'Profesional' // En producción, buscar del servicio de usuarios
          },
          reason: data.reason,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy
        };

        appointments.push(newAppointment);
        resolve(newAppointment);
      }, 600);
    });
  },

  update: async (id: string, data: Partial<AppointmentFormData>): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) {
          reject(new Error('Appointment not found'));
          return;
        }

        appointments[index] = {
          ...appointments[index],
          ...data,
          updatedAt: new Date().toISOString()
        };

        resolve(appointments[index]);
      }, 600);
    });
  },

  updateStatus: async (
    id: string,
    status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show',
    reason?: string
  ): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) {
          reject(new Error('Appointment not found'));
          return;
        }

        const updates: any = {
          status,
          updatedAt: new Date().toISOString()
        };

        if (status === 'confirmed') {
          updates.confirmedAt = new Date().toISOString();
        } else if (status === 'completed') {
          updates.completedAt = new Date().toISOString();
        } else if (status === 'cancelled') {
          updates.cancelledAt = new Date().toISOString();
          updates.cancellationReason = reason;
        }

        appointments[index] = {
          ...appointments[index],
          ...updates
        };

        resolve(appointments[index]);
      }, 500);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) {
          reject(new Error('Appointment not found'));
          return;
        }
        appointments.splice(index, 1);
        resolve();
      }, 400);
    });
  },

  sendReminder: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) {
          reject(new Error('Appointment not found'));
          return;
        }

        appointments[index] = {
          ...appointments[index],
          reminderSent: true,
          reminderSentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        resolve();
      }, 500);
    });
  }
};
