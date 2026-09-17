import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { MedicalRecord, MedicalRecordFormData } from '../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PatientSearch } from '../../patients/components/PatientSearch';
import { patientService } from '../../patients/services/patientService';
import { useSnackbar } from '../../../components/Snackbar';
import type { Patient } from '../../patients/types';

interface MedicalRecordFormProps {
  record?: MedicalRecord;
  patientId?: string;
  onSubmit: (data: MedicalRecordFormData) => Promise<void>;
  isEditing?: boolean;
}

export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  record,
  patientId,
  onSubmit,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cliente: si no viene fijado por prop/registro, se elige aquí
  const patientLocked = !!patientId || !!record?.patientId;
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [clientMode, setClientMode] = useState<'search' | 'new'>('search');
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({ firstName: '', lastName: '', phone: '' });

  const [formData, setFormData] = useState<MedicalRecordFormData>({
    patientId: patientId || record?.patientId || '',
    date: record?.date || new Date().toISOString().split('T')[0],
    examType: record?.examType || 'routine',
    visualAcuity: record?.visualAcuity || {
      right: { uncorrected: '', corrected: '' },
      left: { uncorrected: '', corrected: '' }
    },
    refraction: record?.refraction || {
      right: { sphere: 0, cylinder: 0, axis: 0, pd: 0 },
      left: { sphere: 0, cylinder: 0, axis: 0, pd: 0 }
    },
    prescription: record?.prescription,
    intraocularPressure: record?.intraocularPressure,
    eyeHealth: record?.eyeHealth,
    diagnosis: record?.diagnosis || [],
    notes: record?.notes || '',
    nextVisitRecommended: record?.nextVisitRecommended || '',
    practitioner: record?.practitioner || {
      id: 'OPT001',
      name: 'Dr. Optometrista'
    }
  });

  const [diagnosisText, setDiagnosisText] = useState(record?.diagnosis?.join(', ') || '');

  const handleRefractionChange = (eye: 'right' | 'left', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      refraction: {
        ...prev.refraction,
        [eye]: {
          ...prev.refraction[eye],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleVisualAcuityChange = (eye: 'right' | 'left', type: 'uncorrected' | 'corrected', value: string) => {
    setFormData(prev => ({
      ...prev,
      visualAcuity: {
        ...prev.visualAcuity,
        [eye]: {
          ...prev.visualAcuity[eye],
          [type]: value
        }
      }
    }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setSelectedPatientName(`${patient.firstName} ${patient.lastName}`);
  };

  const handleCreateClient = async () => {
    if (!newClient.firstName.trim() || !newClient.lastName.trim()) {
      showError('Nombre y apellido son obligatorios');
      return;
    }
    setCreatingClient(true);
    try {
      const created = await patientService.create({
        firstName: newClient.firstName.trim(),
        lastName: newClient.lastName.trim(),
        phone: newClient.phone.trim() || undefined,
      } as Parameters<typeof patientService.create>[0]);
      handlePatientSelect(created);
      setClientMode('search');
      setNewClient({ firstName: '', lastName: '', phone: '' });
      showSuccess('Cliente creado y seleccionado');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setCreatingClient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      setError('Debe seleccionar un cliente para el examen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData: MedicalRecordFormData = {
        ...formData,
        diagnosis: diagnosisText ? diagnosisText.split(',').map(d => d.trim()).filter(Boolean) : []
      };

      await onSubmit(submitData);
      navigate('/medical-records');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar historial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Cliente */}
      {patientLocked ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cliente</h2>
          <p className="text-sm text-gray-600">
            {selectedPatientName
              ? <>Examen para <span className="font-semibold">{selectedPatientName}</span></>
              : 'Examen asociado al paciente seleccionado.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">Cliente</h2>
            <div className="inline-flex rounded-lg bg-gray-100 p-1 text-sm">
              <button
                type="button"
                onClick={() => setClientMode('search')}
                className={clsx(
                  'px-3 py-1.5 rounded-md font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40',
                  clientMode === 'search' ? 'bg-white text-theme-dark-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => setClientMode('new')}
                className={clsx(
                  'px-3 py-1.5 rounded-md font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40',
                  clientMode === 'new' ? 'bg-white text-theme-dark-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                + Cliente nuevo
              </button>
            </div>
          </div>

          {clientMode === 'search' ? (
            <PatientSearch onSelect={handlePatientSelect} showCreateButton={false} autoFocus />
          ) : (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Nombre *" value={newClient.firstName} onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })} autoFocus />
                <Input label="Apellido *" value={newClient.lastName} onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })} />
                <Input label="Teléfono" type="tel" placeholder="Opcional" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Button type="button" onClick={handleCreateClient} disabled={creatingClient} className="!w-auto px-5">
                  {creatingClient ? 'Creando...' : 'Crear y usar cliente'}
                </Button>
                <p className="text-xs text-gray-500">Solo nombre y apellido son obligatorios.</p>
              </div>
            </div>
          )}

          {formData.patientId && clientMode === 'search' && selectedPatientName && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 ring-1 ring-inset ring-green-600/20">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cliente seleccionado: <span className="font-semibold">{selectedPatientName}</span>
            </div>
          )}
        </div>
      )}

      {/* Información General */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Examen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Fecha del Examen"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Examen *
            </label>
            <select
              value={formData.examType}
              onChange={(e) => setFormData({ ...formData, examType: e.target.value as any })}
              className="w-full px-4 py-2 border border-theme-divider rounded-lg focus:ring-2 focus:ring-theme-primary/30"
              required
            >
              <option value="routine">Examen de Rutina</option>
              <option value="emergency">Emergencia</option>
              <option value="followup">Seguimiento</option>
              <option value="contact-lens">Lentes de Contacto</option>
            </select>
          </div>
          <Input
            label="Distancia Pupilar (DP)"
            type="number"
            step="0.5"
            value={formData.refraction.right.pd || ''}
            onChange={(e) => handleRefractionChange('right', 'pd', e.target.value)}
            placeholder="Ej: 65"
          />
        </div>
      </div>

      {/* Agudeza Visual */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Agudeza Visual (AV)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ojo Derecho */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Ojo Derecho (OD)</h3>
            <div className="space-y-4">
              <Input
                label="Sin Corrección"
                value={formData.visualAcuity.right.uncorrected}
                onChange={(e) => handleVisualAcuityChange('right', 'uncorrected', e.target.value)}
                placeholder="Ej: 20/40"
              />
              <Input
                label="Con Corrección"
                value={formData.visualAcuity.right.corrected}
                onChange={(e) => handleVisualAcuityChange('right', 'corrected', e.target.value)}
                placeholder="Ej: 20/20"
              />
            </div>
          </div>

          {/* Ojo Izquierdo */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Ojo Izquierdo (OI)</h3>
            <div className="space-y-4">
              <Input
                label="Sin Corrección"
                value={formData.visualAcuity.left.uncorrected}
                onChange={(e) => handleVisualAcuityChange('left', 'uncorrected', e.target.value)}
                placeholder="Ej: 20/50"
              />
              <Input
                label="Con Corrección"
                value={formData.visualAcuity.left.corrected}
                onChange={(e) => handleVisualAcuityChange('left', 'corrected', e.target.value)}
                placeholder="Ej: 20/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Refracción / Receta de Lentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Receta de Lentes</h2>

        {/* Ojo Derecho (OD) */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 bg-blue-50 px-4 py-2 rounded">Ojo Derecho (OD)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Esfera"
              type="number"
              step="0.25"
              value={formData.refraction.right.sphere}
              onChange={(e) => handleRefractionChange('right', 'sphere', e.target.value)}
              placeholder="-3.25"
            />
            <Input
              label="Cilindro"
              type="number"
              step="0.25"
              value={formData.refraction.right.cylinder}
              onChange={(e) => handleRefractionChange('right', 'cylinder', e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Eje"
              type="number"
              min="0"
              max="180"
              value={formData.refraction.right.axis}
              onChange={(e) => handleRefractionChange('right', 'axis', e.target.value)}
              placeholder="0"
            />
            <Input
              label="ADD (Adición)"
              type="number"
              step="0.25"
              value={formData.refraction.right.add || ''}
              onChange={(e) => handleRefractionChange('right', 'add', e.target.value)}
              placeholder="1.0"
            />
          </div>
        </div>

        {/* Ojo Izquierdo (OI) */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 bg-green-50 px-4 py-2 rounded">Ojo Izquierdo (OI)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Esfera"
              type="number"
              step="0.25"
              value={formData.refraction.left.sphere}
              onChange={(e) => handleRefractionChange('left', 'sphere', e.target.value)}
              placeholder="-2.25"
            />
            <Input
              label="Cilindro"
              type="number"
              step="0.25"
              value={formData.refraction.left.cylinder}
              onChange={(e) => handleRefractionChange('left', 'cylinder', e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Eje"
              type="number"
              min="0"
              max="180"
              value={formData.refraction.left.axis}
              onChange={(e) => handleRefractionChange('left', 'axis', e.target.value)}
              placeholder="0"
            />
            <Input
              label="ADD (Adición)"
              type="number"
              step="0.25"
              value={formData.refraction.left.add || ''}
              onChange={(e) => handleRefractionChange('left', 'add', e.target.value)}
              placeholder="1.0"
            />
          </div>
        </div>
      </div>

      {/* Diagnóstico y Observaciones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Diagnóstico y Observaciones</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnósticos
            </label>
            <textarea
              value={diagnosisText}
              onChange={(e) => setDiagnosisText(e.target.value)}
              placeholder="Separar por comas (Ej: Miopía leve bilateral, Astigmatismo)"
              className="w-full px-4 py-2 border border-theme-divider rounded-lg focus:ring-2 focus:ring-theme-primary/30"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones / Notas del Examen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales, recomendaciones, observaciones del paciente..."
              className="w-full px-4 py-2 border border-theme-divider rounded-lg focus:ring-2 focus:ring-theme-primary/30"
              rows={4}
            />
          </div>

          <Input
            label="Próxima Visita Recomendada"
            type="date"
            value={formData.nextVisitRecommended}
            onChange={(e) => setFormData({ ...formData, nextVisitRecommended: e.target.value })}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/medical-records')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : isEditing ? 'Actualizar Historial' : 'Guardar Historial'}
        </Button>
      </div>
    </form>
  );
};
