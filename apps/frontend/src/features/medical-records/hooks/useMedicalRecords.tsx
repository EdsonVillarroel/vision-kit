import { useState, useEffect, useCallback } from 'react';
import { medicalRecordService } from '../services/medicalRecordService';
import type { MedicalRecord, MedicalRecordFormData } from '../types';

export const useMedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicalRecordService.getAll();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historiales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const getByPatientId = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicalRecordService.getByPatientId(patientId);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historiales del paciente');
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (data: MedicalRecordFormData) => {
    setError(null);
    try {
      const newRecord = await medicalRecordService.create(data);
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear historial');
      throw err;
    }
  };

  const updateRecord = async (id: string, data: Partial<MedicalRecordFormData>) => {
    setError(null);
    try {
      const updated = await medicalRecordService.update(id, data);
      setRecords(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar historial');
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    setError(null);
    try {
      await medicalRecordService.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar historial');
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    fetchRecords,
    getByPatientId,
    createRecord,
    updateRecord,
    deleteRecord
  };
};

export const useMedicalRecord = (id: string) => {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await medicalRecordService.getById(id);
        setRecord(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar historial');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecord();
    }
  }, [id]);

  return { record, loading, error };
};
