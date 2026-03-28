import { Link } from 'react-router-dom';
import type { Patient } from '../types';
import { Button } from '../../../components/ui/Button';

interface PatientDetailsProps {
  patient: Patient;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient }) => {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatGender = (gender: string) => {
    const genders: Record<string, string> = {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro'
    };
    return genders[gender] || gender;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <span>{calculateAge(patient.dateOfBirth)} años</span>
                <span>•</span>
                <span>{formatGender(patient.gender)}</span>
                <span>•</span>
                <span>ID: {patient.id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={`/patients/${patient.id}/edit`}>
              <Button variant="secondary">
                ✏️ Editar
              </Button>
            </Link>
            <Link to="/patients">
              <Button variant="secondary">
                ← Volver
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información de Contacto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-base font-medium text-gray-900">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base font-medium text-gray-900">{patient.email || 'No registrado'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="text-base font-medium text-gray-900">{patient.address}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {patient.city}, {patient.state} {patient.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Seguro Médico */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Seguro Médico</h2>
            {patient.insurance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Proveedor</p>
                  <p className="text-base font-medium text-gray-900">{patient.insurance.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Número de Póliza</p>
                  <p className="text-base font-medium text-gray-900">{patient.insurance.policyNumber}</p>
                </div>
                {patient.insurance.groupNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Número de Grupo</p>
                    <p className="text-base font-medium text-gray-900">{patient.insurance.groupNumber}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Sin seguro médico registrado</p>
            )}
          </div>

          {/* Contacto de Emergencia */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contacto de Emergencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="text-base font-medium text-gray-900">{patient.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relación</p>
                <p className="text-base font-medium text-gray-900">{patient.emergencyContact.relationship}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-base font-medium text-gray-900">{patient.emergencyContact.phone}</p>
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información Médica</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Alergias</p>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Sin alergias registradas</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Condiciones Médicas</p>
                {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalConditions.map((condition, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Sin condiciones médicas registradas</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Última Visita</p>
                <p className="text-base font-medium text-gray-900">
                  {patient.lastVisit
                    ? new Date(patient.lastVisit).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Sin visitas'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paciente desde</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(patient.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link to={`/appointments/new?patientId=${patient.id}`} className="block">
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left">
                  📅 Agendar Cita
                </button>
              </Link>
              <Link to={`/medical-records/new?patientId=${patient.id}`} className="block">
                <button className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left">
                  👁️ Nuevo Examen
                </button>
              </Link>
              <Link to={`/sales/new?patientId=${patient.id}`} className="block">
                <button className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left">
                  🛒 Nueva Venta
                </button>
              </Link>
              <Link to={`/medical-records?patientId=${patient.id}`} className="block">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left">
                  📄 Ver Historial Médico
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
