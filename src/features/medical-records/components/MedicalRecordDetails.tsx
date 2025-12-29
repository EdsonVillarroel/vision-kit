import { Link, useNavigate } from 'react-router-dom';
import type { MedicalRecord } from '../types';
import { Button } from '../../../components/ui/Button';

interface MedicalRecordDetailsProps {
  record: MedicalRecord;
}

export const MedicalRecordDetails: React.FC<MedicalRecordDetailsProps> = ({ record }) => {
  const navigate = useNavigate();

  const getExamTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      routine: 'Examen de Rutina',
      emergency: 'Emergencia',
      followup: 'Seguimiento',
      'contact-lens': 'Lentes de Contacto'
    };
    return labels[type] || type;
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === 0) return '0.00';
    return (num >= 0 ? '+' : '') + num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/medical-records')}
            className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
          >
            ← Volver a Historia Clínica
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detalle de Examen</h1>
          <p className="text-gray-600 mt-2">
            {new Date(record.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            🖨️ Imprimir
          </Button>
          <Link to={`/medical-records/${record.id}/edit`}>
            <Button variant="secondary">
              ✏️ Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Examen</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Paciente ID</p>
            <p className="font-medium text-gray-900">{record.patientId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-medium text-gray-900">
              {new Date(record.date).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo de Examen</p>
            <p className="font-medium text-gray-900">{getExamTypeLabel(record.examType)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Profesional</p>
            <p className="font-medium text-gray-900">{record.practitioner.name}</p>
          </div>
        </div>
      </div>

      {/* Agudeza Visual */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Agudeza Visual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Ojo Derecho (OD)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sin corrección:</span>
                <span className="font-medium">{record.visualAcuity.right.uncorrected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Con corrección:</span>
                <span className="font-medium">{record.visualAcuity.right.corrected}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Ojo Izquierdo (OI)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sin corrección:</span>
                <span className="font-medium">{record.visualAcuity.left.uncorrected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Con corrección:</span>
                <span className="font-medium">{record.visualAcuity.left.corrected}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receta de Lentes (Refracción) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Receta de Lentes</h2>

        {/* Tabla de Refracción */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ojo</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Esfera</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Cilindro</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Eje</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">ADD</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">DP</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 bg-blue-50">
                <td className="py-4 px-4 font-semibold text-gray-900">OD (Derecho)</td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {formatNumber(record.refraction.right.sphere)}
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {formatNumber(record.refraction.right.cylinder)}
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {record.refraction.right.axis}°
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {record.refraction.right.add ? formatNumber(record.refraction.right.add) : '-'}
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {record.refraction.right.pd || '-'}
                </td>
              </tr>
              <tr className="border-b border-gray-200 bg-green-50">
                <td className="py-4 px-4 font-semibold text-gray-900">OI (Izquierdo)</td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {formatNumber(record.refraction.left.sphere)}
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {formatNumber(record.refraction.left.cylinder)}
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {record.refraction.left.axis}°
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {record.refraction.left.add ? formatNumber(record.refraction.left.add) : '-'}
                </td>
                <td className="text-center py-4 px-4 font-mono text-lg">
                  {record.refraction.left.pd || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Información adicional de prescripción si existe */}
        {record.prescription && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Información de Prescripción</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {record.prescription.frameType && (
                <div>
                  <p className="text-sm text-gray-600">Tipo de Armazón</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {record.prescription.frameType}
                  </p>
                </div>
              )}
              {record.prescription.lensType && (
                <div>
                  <p className="text-sm text-gray-600">Tipo de Lente</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {record.prescription.lensType}
                  </p>
                </div>
              )}
              {record.prescription.coatings && record.prescription.coatings.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Tratamientos</p>
                  <p className="font-medium text-gray-900">
                    {record.prescription.coatings.length} aplicados
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Presión Intraocular */}
      {record.intraocularPressure && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Presión Intraocular (PIO)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Ojo Derecho (OD)</p>
              <p className="text-2xl font-bold text-gray-900">
                {record.intraocularPressure.right} {record.intraocularPressure.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ojo Izquierdo (OI)</p>
              <p className="text-2xl font-bold text-gray-900">
                {record.intraocularPressure.left} {record.intraocularPressure.unit}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnóstico */}
      {record.diagnosis && record.diagnosis.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnóstico</h2>
          <div className="flex flex-wrap gap-2">
            {record.diagnosis.map((diagnosis, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {diagnosis}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Observaciones */}
      {record.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Observaciones</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
        </div>
      )}

      {/* Salud Ocular */}
      {record.eyeHealth && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Salud Ocular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ojo Derecho (OD)</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Segmento Anterior</p>
                  <p className="text-gray-900">{record.eyeHealth.right.anterior}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Segmento Posterior</p>
                  <p className="text-gray-900">{record.eyeHealth.right.posterior}</p>
                </div>
                {record.eyeHealth.right.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notas</p>
                    <p className="text-gray-900">{record.eyeHealth.right.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ojo Izquierdo (OI)</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Segmento Anterior</p>
                  <p className="text-gray-900">{record.eyeHealth.left.anterior}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Segmento Posterior</p>
                  <p className="text-gray-900">{record.eyeHealth.left.posterior}</p>
                </div>
                {record.eyeHealth.left.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notas</p>
                    <p className="text-gray-900">{record.eyeHealth.left.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Próxima Visita */}
      {record.nextVisitRecommended && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-semibold text-gray-900">Próxima Visita Recomendada</p>
              <p className="text-gray-700">
                {new Date(record.nextVisitRecommended).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
