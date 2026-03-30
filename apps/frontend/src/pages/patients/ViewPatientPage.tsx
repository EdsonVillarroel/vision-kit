import { useParams } from 'react-router-dom';
import { usePatient } from '../../features/patients/hooks/usePatients';
import { PatientDetails } from '../../features/patients/components/PatientDetails';
import { SkeletonDetailCard } from '../../components/ui/Skeleton';

export const ViewPatientPage = () => {
  const { id } = useParams<{ id: string }>();
  const { patient, loading, error } = usePatient(id!);

  if (loading) {
    return <SkeletonDetailCard />;
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Paciente no encontrado'}
      </div>
    );
  }

  return <PatientDetails patient={patient} />;
};
