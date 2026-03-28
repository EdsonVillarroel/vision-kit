import { ClinicalExamForm } from '../../features/clinical-exams/components/ClinicalExamForm';
import { useClinicalExams } from '../../features/clinical-exams/hooks/useClinicalExams';

export const NewClinicalExamPage = () => {
  const { createExam } = useClinicalExams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-theme-dark-primary">Nuevo Examen Clínico</h1>
        <p className="text-theme-secondary-text mt-2">Registrar nuevo examen visual</p>
      </div>
      <ClinicalExamForm onSubmit={createExam} />
    </div>
  );
};
