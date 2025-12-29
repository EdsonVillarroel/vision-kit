import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MedicalRecord, MedicalRecordFormData } from '../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
