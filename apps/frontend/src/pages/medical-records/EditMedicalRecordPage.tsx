import { useParams, useNavigate } from 'react-router-dom';
import { useMedicalRecord, useMedicalRecords } from '../../features/medical-records/hooks/useMedicalRecords';
import { MedicalRecordForm } from '../../features/medical-records/components/MedicalRecordForm';
import type { MedicalRecordFormData } from '../../features/medical-records/types';
import { SkeletonFormCard } from '../../components/ui/Skeleton';

export const EditMedicalRecordPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { record, loading, error } = useMedicalRecord(id!);
  const { updateRecord } = useMedicalRecords();

  const handleSubmit = async (data: MedicalRecordFormData) => {
    await updateRecord(id!, data);
    navigate(`/medical-records/${id}`);
  };

  if (loading) {
    return <SkeletonFormCard fields={8} />;
  }

  if (error || !record) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Registro médico no encontrado'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(`/medical-records/${id}`)}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
        >
          ← Volver al Detalle
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Examen Oftalmológico</h1>
        <p className="text-gray-600 mt-2">Actualizar información del examen</p>
      </div>

      <MedicalRecordForm
        record={record}
        onSubmit={handleSubmit}
        isEditing
      />
    </div>
  );
};
