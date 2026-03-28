import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMedicalRecords } from '../../features/medical-records/hooks/useMedicalRecords';
import { MedicalRecordForm } from '../../features/medical-records/components/MedicalRecordForm';
import type { MedicalRecordFormData } from '../../features/medical-records/types';

export const NewMedicalRecordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { createRecord } = useMedicalRecords();

  const handleSubmit = async (data: MedicalRecordFormData) => {
    await createRecord(data);
    navigate('/medical-records');
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/medical-records')}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
        >
          ← Volver a Historia Clínica
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Examen Oftalmológico</h1>
        <p className="text-gray-600 mt-2">Registrar nuevo examen y receta de lentes</p>
      </div>

      <MedicalRecordForm
        onSubmit={handleSubmit}
        patientId={patientId || undefined}
      />
    </div>
  );
};
