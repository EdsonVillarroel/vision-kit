import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import type { Patient, PatientStatus } from '../types';

interface PatientSearchProps {
  onSelect?: (patient: Patient) => void;
  showCreateButton?: boolean;
  autoFocus?: boolean;
}

export const PatientSearch = ({ onSelect, showCreateButton = true, autoFocus = false }: PatientSearchProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await patientService.search(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching patients:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchQuery(`${patient.firstName} ${patient.lastName} - ${patient.identificationId}`);
    setShowResults(false);
    if (onSelect) {
      onSelect(patient);
    }
  };

  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getStatusBadge = (status: PatientStatus) => {
    const badges = {
      frequent: {
        label: 'Cliente Frecuente',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      warning: {
        label: 'Alerta',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      normal: {
        label: 'Normal',
        className: 'bg-gray-100 text-gray-600 border-gray-200'
      }
    };
    return badges[status];
  };

  const getPatientCardClassName = (status: PatientStatus) => {
    const baseClass = 'p-4 border-l-4 hover:bg-gray-50 cursor-pointer transition-colors';
    const statusClasses = {
      frequent: 'border-green-500 bg-green-50',
      warning: 'border-yellow-500 bg-yellow-50',
      normal: 'border-gray-300 bg-white'
    };
    return `${baseClass} ${statusClasses[status]}`;
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Paciente <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="patient-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Buscar por nombre, cédula, teléfono o email..."
              autoFocus={autoFocus}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
            {selectedPatient && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Busca por nombre, cédula de identidad, teléfono o email
          </p>
        </div>

        {showCreateButton && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => navigate('/patients/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Nuevo Paciente
            </button>
          </div>
        )}
      </div>

      {/* Resultado seleccionado */}
      {selectedPatient && (
        <div className="mt-3 p-4 border-l-4 rounded-lg bg-blue-50 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h4>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(selectedPatient.status).className}`}>
                  {getStatusBadge(selectedPatient.status).label}
                </span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Cédula:</span> {selectedPatient.identificationId}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span> {selectedPatient.phone}
                </div>
                <div>
                  <span className="font-medium">Visitas:</span> {selectedPatient.visitCount}
                </div>
                <div>
                  <span className="font-medium">Total gastado:</span> ${selectedPatient.totalSpent.toLocaleString()}
                </div>
              </div>

              {selectedPatient.status === 'warning' && selectedPatient.warningReason && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                  <p className="font-semibold text-yellow-800">⚠️ Alerta:</p>
                  <p className="text-yellow-700">{selectedPatient.warningReason}</p>
                </div>
              )}

              {selectedPatient.notes && (
                <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">
                  <p className="font-semibold">Notas:</p>
                  <p>{selectedPatient.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {showResults && searchResults.length > 0 && !selectedPatient && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 py-1">
              {searchResults.length} resultado(s) encontrado(s)
            </p>
            {searchResults.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className={getPatientCardClassName(patient.status)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(patient.status).className}`}>
                        {getStatusBadge(patient.status).label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Cédula:</span> {patient.identificationId}
                      {' • '}
                      <span className="font-medium">Tel:</span> {patient.phone}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {patient.visitCount} visitas • ${patient.totalSpent.toLocaleString()} gastado
                      {patient.lastVisit && ` • Última visita: ${new Date(patient.lastVisit).toLocaleDateString('es-ES')}`}
                    </div>

                    {patient.status === 'warning' && patient.warningReason && (
                      <div className="mt-2 text-xs text-yellow-700 font-medium">
                        ⚠️ {patient.warningReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No hay resultados */}
      {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-gray-600 text-center">
            No se encontraron pacientes con "{searchQuery}"
          </p>
          {showCreateButton && (
            <button
              type="button"
              onClick={() => navigate('/patients/new')}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear nuevo paciente
            </button>
          )}
        </div>
      )}
    </div>
  );
};
