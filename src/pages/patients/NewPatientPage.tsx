import { usePatients } from '../../features/patients/hooks/usePatients';
import { PatientForm } from '../../features/patients/components/PatientForm';

export const NewPatientPage = () => {
  const { createPatient } = usePatients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Paciente</h1>
        <p className="text-gray-600 mt-2">Registrar un nuevo paciente en el sistema</p>
      </div>

      <PatientForm onSubmit={createPatient} />
    </div>
  );
};
