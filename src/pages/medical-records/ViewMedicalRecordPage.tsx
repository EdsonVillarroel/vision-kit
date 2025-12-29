import { useParams } from 'react-router-dom';
import { useMedicalRecord } from '../../features/medical-records/hooks/useMedicalRecords';
import { MedicalRecordDetails } from '../../features/medical-records/components/MedicalRecordDetails';

export const ViewMedicalRecordPage = () => {
  const { id } = useParams<{ id: string }>();
  const { record, loading, error } = useMedicalRecord(id!);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Registro médico no encontrado'}
      </div>
    );
  }

  return <MedicalRecordDetails record={record} />;
};
