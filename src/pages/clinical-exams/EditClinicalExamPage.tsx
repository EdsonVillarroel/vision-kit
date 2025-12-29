import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClinicalExamForm } from '../../features/clinical-exams/components/ClinicalExamForm';
import { useClinicalExams } from '../../features/clinical-exams/hooks/useClinicalExams';
import { clinicalExamService } from '../../features/clinical-exams/services/clinicalExamService';
import type { ClinicalExam } from '../../features/clinical-exams/types';

export const EditClinicalExamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { updateExam } = useClinicalExams();
  const [exam, setExam] = useState<ClinicalExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExam = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clinicalExamService.getById(id);
        setExam(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar examen');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-theme-primary border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-xl border border-red-400/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error || 'Examen no encontrado'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-theme-dark-primary">Editar Examen Clínico</h1>
        <p className="text-theme-secondary-text mt-2">Actualizar información del examen</p>
      </div>
      <ClinicalExamForm
        exam={exam}
        onSubmit={(data) => updateExam(id!, data)}
        isEditing
      />
    </div>
  );
};
