import { useParams } from 'react-router-dom';
import { usePatient } from '../../features/patients/hooks/usePatients';
import { usePatients } from '../../features/patients/hooks/usePatients';
import { PatientForm } from '../../features/patients/components/PatientForm';

export const EditPatientPage = () => {
  const { id } = useParams<{ id: string }>();
  const { patient, loading, error } = usePatient(id!);
  const { updatePatient } = usePatients();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Paciente no encontrado'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Paciente</h1>
        <p className="text-gray-600 mt-2">
          Actualizar información de {patient.firstName} {patient.lastName}
        </p>
      </div>

      <PatientForm
        patient={patient}
        onSubmit={(data) => updatePatient(patient.id, data)}
        isEditing
      />
    </div>
  );
};
