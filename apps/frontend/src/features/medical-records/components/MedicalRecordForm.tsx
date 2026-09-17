import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { MedicalRecord, MedicalRecordFormData } from '../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DioptryStepper } from '../../../components/ui/DioptryStepper';
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
  const [showAcuity, setShowAcuity] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);

  // Setter numérico (para DioptryStepper y campos numéricos de la tabla RX)
  const setRefraction = (eye: 'right' | 'left', field: 'sphere' | 'cylinder' | 'axis' | 'add' | 'pd', value: number) => {
    setFormData(prev => ({
      ...prev,
      refraction: { ...prev.refraction, [eye]: { ...prev.refraction[eye], [field]: value } }
    }));
  };

  // Copia la graduación del ojo derecho al izquierdo (caso muy frecuente)
  const copyODtoOI = () => {
    setFormData(prev => ({
      ...prev,
      refraction: { ...prev.refraction, left: { ...prev.refraction.right } }
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

  const RX_FIELDS = [
    { key: 'sphere', label: 'Esfera' },
    { key: 'cylinder', label: 'Cilindro' },
    { key: 'axis', label: 'Eje' },
    { key: 'add', label: 'ADD' },
    { key: 'pd', label: 'DP' },
  ] as const;

  const cellInput =
    'h-10 w-full min-w-0 rounded-lg bg-white ring-1 ring-black/[0.08] px-2 text-center text-base font-semibold tnum text-theme-primary-text outline-none focus:ring-2 focus:ring-theme-primary/40';

  const renderControl = (eye: 'right' | 'left', field: (typeof RX_FIELDS)[number]['key']) => {
    const eyeLabel = eye === 'right' ? 'OD' : 'OI';
    const r = formData.refraction[eye];
    if (field === 'sphere' || field === 'cylinder' || field === 'add') {
      return (
        <DioptryStepper
          value={r[field] ?? 0}
          onChange={(v) => setRefraction(eye, field, v)}
          showSign
          ariaLabel={`${field} ${eyeLabel}`}
        />
      );
    }
    if (field === 'axis') {
      return (
        <input
          type="number" min={0} max={180} value={r.axis ?? 0}
          onChange={(e) => setRefraction(eye, 'axis', Math.min(180, Math.max(0, parseInt(e.target.value) || 0)))}
          className={cellInput} aria-label={`Eje ${eyeLabel}`}
        />
      );
    }
    // pd
    return (
      <input
        type="number" step={0.5} value={r.pd ?? ''} placeholder="—"
        onChange={(e) => setRefraction(eye, 'pd', parseFloat(e.target.value) || 0)}
        className={cellInput} aria-label={`DP ${eyeLabel}`}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
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

      {/* Datos del examen */}
      <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Fecha del examen"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Tipo de examen
            </label>
            <select
              value={formData.examType}
              onChange={(e) => setFormData({ ...formData, examType: e.target.value as any })}
              className="w-full px-4 py-3 bg-white border border-theme-divider rounded-lg outline-none focus:ring-2 focus:ring-theme-primary/40"
            >
              <option value="routine">Examen de rutina</option>
              <option value="emergency">Emergencia</option>
              <option value="followup">Seguimiento</option>
              <option value="contact-lens">Lentes de contacto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Graduación (RX) */}
      <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-theme-dark-primary">Graduación</h2>
            <p className="text-sm text-theme-secondary-text mt-1">Receta de lentes — ajusta en pasos de 0.25.</p>
          </div>
          <button
            type="button"
            onClick={copyODtoOI}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-theme-primary ring-1 ring-inset ring-theme-primary/30 transition-colors duration-150 hover:bg-theme-light-primary/50 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/50"
          >
            Copiar OD → OI
          </button>
        </div>

        {/* Desktop: tabla alineada */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[3rem_repeat(5,1fr)] items-center gap-3">
            <div />
            {RX_FIELDS.map((f) => (
              <div key={f.key} className="text-center text-xs font-semibold uppercase tracking-wide text-theme-secondary-text">{f.label}</div>
            ))}
            {(['right', 'left'] as const).map((eye) => (
              <div key={eye} className="contents">
                <div className="text-sm font-bold text-theme-dark-primary">{eye === 'right' ? 'OD' : 'OI'}</div>
                {RX_FIELDS.map((f) => (
                  <div key={f.key}>{renderControl(eye, f.key)}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Móvil: por ojo con etiquetas */}
        <div className="md:hidden space-y-6">
          {(['right', 'left'] as const).map((eye) => (
            <div key={eye}>
              <h3 className="mb-3 font-semibold text-theme-dark-primary">{eye === 'right' ? 'Ojo Derecho (OD)' : 'Ojo Izquierdo (OI)'}</h3>
              <div className="grid grid-cols-2 gap-3">
                {RX_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs font-medium text-theme-secondary-text">{f.label}</label>
                    {renderControl(eye, f.key)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agudeza Visual (opcional, plegable) */}
      <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] p-6">
        <button
          type="button"
          onClick={() => setShowAcuity((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded-lg"
        >
          <div>
            <h2 className="text-xl font-bold text-theme-dark-primary">Agudeza visual (AV) <span className="text-sm font-normal text-theme-secondary-text">— opcional</span></h2>
          </div>
          <svg className={clsx('h-5 w-5 text-theme-secondary-text transition-transform duration-200', showAcuity && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAcuity && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {(['right', 'left'] as const).map((eye) => (
              <div key={eye}>
                <h3 className="mb-3 font-semibold text-theme-dark-primary">{eye === 'right' ? 'Ojo Derecho (OD)' : 'Ojo Izquierdo (OI)'}</h3>
                <div className="space-y-3">
                  <Input
                    label="Sin corrección"
                    value={formData.visualAcuity[eye].uncorrected}
                    onChange={(e) => handleVisualAcuityChange(eye, 'uncorrected', e.target.value)}
                    placeholder="Ej: 20/40"
                  />
                  <Input
                    label="Con corrección"
                    value={formData.visualAcuity[eye].corrected}
                    onChange={(e) => handleVisualAcuityChange(eye, 'corrected', e.target.value)}
                    placeholder="Ej: 20/20"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diagnóstico y observaciones (opcional, plegable) */}
      <div className="bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] p-6">
        <button
          type="button"
          onClick={() => setShowDiagnosis((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded-lg"
        >
          <h2 className="text-xl font-bold text-theme-dark-primary">Diagnóstico y observaciones <span className="text-sm font-normal text-theme-secondary-text">— opcional</span></h2>
          <svg className={clsx('h-5 w-5 text-theme-secondary-text transition-transform duration-200', showDiagnosis && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDiagnosis && (
          <div className="mt-5 space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-theme-primary-text mb-2">Diagnósticos</label>
              <textarea
                value={diagnosisText}
                onChange={(e) => setDiagnosisText(e.target.value)}
                placeholder="Separar por comas (Ej: Miopía leve bilateral, Astigmatismo)"
                className="w-full px-4 py-3 bg-white border border-theme-divider rounded-lg outline-none focus:ring-2 focus:ring-theme-primary/40"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-primary-text mb-2">Observaciones / notas del examen</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales, recomendaciones, observaciones del paciente..."
                className="w-full px-4 py-3 bg-white border border-theme-divider rounded-lg outline-none focus:ring-2 focus:ring-theme-primary/40"
                rows={4}
              />
            </div>
            <Input
              label="Próxima visita recomendada"
              type="date"
              value={formData.nextVisitRecommended}
              onChange={(e) => setFormData({ ...formData, nextVisitRecommended: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Barra de acción fija */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/[0.06] bg-white/90 backdrop-blur-sm lg:pl-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <p className="hidden text-sm text-theme-secondary-text sm:block">
            {formData.patientId
              ? <>Examen para <span className="font-semibold text-theme-primary-text">{selectedPatientName || 'el paciente seleccionado'}</span></>
              : 'Selecciona un cliente para guardar'}
          </p>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button type="button" variant="secondary" onClick={() => navigate('/medical-records')} disabled={loading} className="!w-auto px-5">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="!w-auto px-6">
              {loading ? 'Guardando...' : isEditing ? 'Actualizar examen' : 'Guardar examen'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
