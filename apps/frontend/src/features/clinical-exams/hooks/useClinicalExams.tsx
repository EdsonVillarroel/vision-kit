import { useState, useEffect } from 'react';
import { clinicalExamService } from '../services/clinicalExamService';
import type { ClinicalExam, ClinicalExamFormData } from '../types';
import { useSnackbar } from '../../../components/Snackbar/SnackbarContext';

export const useClinicalExams = () => {
  const [exams, setExams] = useState<ClinicalExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clinicalExamService.getAll();
      setExams(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar exámenes';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsByPatient = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clinicalExamService.getByPatient(patientId);
      setExams(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar exámenes';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (data: ClinicalExamFormData) => {
    try {
      setLoading(true);
      const newExam = await clinicalExamService.create(data);
      setExams(prev => [newExam, ...prev]);
      showSuccess('Examen clínico creado exitosamente');
      return newExam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear examen';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExam = async (id: string, data: Partial<ClinicalExamFormData>) => {
    try {
      setLoading(true);
      const updatedExam = await clinicalExamService.update(id, data);
      setExams(prev => prev.map(exam => exam.id === id ? updatedExam : exam));
      showSuccess('Examen clínico actualizado exitosamente');
      return updatedExam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar examen';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id: string) => {
    try {
      setLoading(true);
      await clinicalExamService.delete(id);
      setExams(prev => prev.filter(exam => exam.id !== id));
      showSuccess('Examen clínico eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar examen';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchExams = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clinicalExamService.search(query);
      setExams(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar exámenes';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return {
    exams,
    loading,
    error,
    fetchExams,
    fetchExamsByPatient,
    createExam,
    updateExam,
    deleteExam,
    searchExams
  };
};
