import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import type { Patient, PatientFormData } from '../types';
import { useSnackbar } from '../../../components/Snackbar';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const searchPatients = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.search(query);
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (data: PatientFormData) => {
    setError(null);
    try {
      const newPatient = await patientService.create(data);
      setPatients(prev => [newPatient, ...prev]);
      showSuccess('Paciente creado exitosamente');
      return newPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear paciente';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const updatePatient = async (id: string, data: Partial<PatientFormData>) => {
    setError(null);
    try {
      const updated = await patientService.update(id, data);
      setPatients(prev => prev.map(p => p.id === id ? updated : p));
      showSuccess('Paciente actualizado exitosamente');
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar paciente';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const deletePatient = async (id: string) => {
    setError(null);
    try {
      await patientService.delete(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      showSuccess('Paciente eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar paciente';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  return {
    patients,
    loading,
    error,
    fetchPatients,
    searchPatients,
    createPatient,
    updatePatient,
    deletePatient
  };
};

export const usePatient = (id: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await patientService.getById(id);
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar paciente');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id]);

  return { patient, loading, error };
};
