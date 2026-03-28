import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import type { Appointment, AppointmentFormData, TimeSlot } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getUpcoming = async (limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getUpcoming(limit);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas próximas');
    } finally {
      setLoading(false);
    }
  };

  const getByDate = async (date: string, practitionerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getByDate(date, practitionerId);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas del día');
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (data: AppointmentFormData, createdBy: { id: string; name: string }) => {
    setError(null);
    try {
      const newAppointment = await appointmentService.create(data, createdBy);
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cita');
      throw err;
    }
  };

  const updateAppointment = async (id: string, data: Partial<AppointmentFormData>) => {
    setError(null);
    try {
      const updated = await appointmentService.update(id, data);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cita');
      throw err;
    }
  };

  const updateStatus = async (id: string, status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show', reason?: string) => {
    setError(null);
    try {
      const updated = await appointmentService.updateStatus(id, status, reason);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
      throw err;
    }
  };

  const deleteAppointment = async (id: string) => {
    setError(null);
    try {
      await appointmentService.delete(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cita');
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    getUpcoming,
    getByDate,
    createAppointment,
    updateAppointment,
    updateStatus,
    deleteAppointment
  };
};

export const useAppointment = (id: string) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await appointmentService.getById(id);
        setAppointment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cita');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointment();
    }
  }, [id]);

  return { appointment, loading, error };
};

export const useAvailableSlots = (date: string, practitionerId: string, duration: number = 30) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!date || !practitionerId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await appointmentService.getAvailableSlots(date, practitionerId, duration);
        setSlots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar horarios');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [date, practitionerId, duration]);

  return { slots, loading, error };
};
