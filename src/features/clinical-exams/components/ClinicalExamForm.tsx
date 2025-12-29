import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../../components/ui';
import type { ClinicalExam, ClinicalExamFormData, EyeMeasurement } from '../types';

interface ClinicalExamFormProps {
  exam?: ClinicalExam;
  onSubmit: (data: ClinicalExamFormData) => Promise<void>;
  isEditing?: boolean;
}

const defaultEyeMeasurement: EyeMeasurement = {
  sphere: 0,
  cylinder: 0,
  axis: 0,
  prism: 0,
  base: ''
};

export const ClinicalExamForm: React.FC<ClinicalExamFormProps> = ({
  exam,
  onSubmit,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClinicalExamFormData>({
    patientId: exam?.patientId || '',
    examNumber: exam?.examNumber || '',
    date: exam?.date || new Date().toISOString().split('T')[0],
    examinerId: exam?.examinerId || '1', // Usuario actual

    farVision: {
      right: exam?.farVision.right || { ...defaultEyeMeasurement },
      left: exam?.farVision.left || { ...defaultEyeMeasurement }
    },

    nearVision: {
      right: exam?.nearVision?.right || { ...defaultEyeMeasurement },
      left: exam?.nearVision?.left || { ...defaultEyeMeasurement }
    },

    pupillaryDistance: {
      right: exam?.pupillaryDistance.right || 0,
      left: exam?.pupillaryDistance.left || 0
    },

    frameMeasurements: {
      height: exam?.frameMeasurements.height || 0,
      right: exam?.frameMeasurements.right || 0,
      left: exam?.frameMeasurements.left || 0
    },

    lensData: {
      right: exam?.lensData?.right || '',
      left: exam?.lensData?.left || ''
    },

    observations: exam?.observations || ''
  });

  const handleEyeMeasurementChange = (
    visionType: 'farVision' | 'nearVision',
    eye: 'right' | 'left',
    field: keyof EyeMeasurement,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [visionType]: {
        ...prev[visionType],
        [eye]: {
          ...prev[visionType]![eye],
          [field]: typeof value === 'string' ? value : parseFloat(value as string) || 0
        }
      }
    }));
  };

  const handlePDChange = (eye: 'right' | 'left', value: string) => {
    setFormData(prev => ({
      ...prev,
      pupillaryDistance: {
        ...prev.pupillaryDistance,
        [eye]: parseFloat(value) || 0
      }
    }));
  };

  const handleFrameChange = (field: keyof typeof formData.frameMeasurements, value: string) => {
    setFormData(prev => ({
      ...prev,
      frameMeasurements: {
        ...prev.frameMeasurements,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      navigate('/clinical-exams');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar examen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-xl border border-red-400/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Información General */}
      <Card>
        <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="N° de Boleta"
            name="examNumber"
            value={formData.examNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, examNumber: e.target.value }))}
            placeholder="ELB5091"
          />
          <Input
            label="Fecha"
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
          <Input
            label="ID Paciente"
            name="patientId"
            value={formData.patientId}
            onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            required
          />
        </div>
      </Card>

      {/* Visión de Lejos */}
      <Card>
        <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Visión de Lejos</h2>
        <div className="space-y-6">
          {/* Ojo Derecho */}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Ojo Derecho (D)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Input
                label="Esférico"
                type="number"
                step="0.25"
                value={formData.farVision.right.sphere}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'right', 'sphere', e.target.value)}
              />
              <Input
                label="Cilíndrico"
                type="number"
                step="0.25"
                value={formData.farVision.right.cylinder}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'right', 'cylinder', e.target.value)}
              />
              <Input
                label="Eje"
                type="number"
                min="0"
                max="180"
                value={formData.farVision.right.axis}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'right', 'axis', e.target.value)}
              />
              <Input
                label="Prisma"
                type="number"
                step="0.25"
                value={formData.farVision.right.prism}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'right', 'prism', e.target.value)}
              />
              <Input
                label="Base"
                value={formData.farVision.right.base}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'right', 'base', e.target.value)}
              />
            </div>
          </div>

          {/* Ojo Izquierdo */}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Ojo Izquierdo (I)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Input
                label="Esférico"
                type="number"
                step="0.25"
                value={formData.farVision.left.sphere}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'left', 'sphere', e.target.value)}
              />
              <Input
                label="Cilíndrico"
                type="number"
                step="0.25"
                value={formData.farVision.left.cylinder}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'left', 'cylinder', e.target.value)}
              />
              <Input
                label="Eje"
                type="number"
                min="0"
                max="180"
                value={formData.farVision.left.axis}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'left', 'axis', e.target.value)}
              />
              <Input
                label="Prisma"
                type="number"
                step="0.25"
                value={formData.farVision.left.prism}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'left', 'prism', e.target.value)}
              />
              <Input
                label="Base"
                value={formData.farVision.left.base}
                onChange={(e) => handleEyeMeasurementChange('farVision', 'left', 'base', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Distancias Pupilares */}
      <Card>
        <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Distancias Pupilares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Distancia Derecha"
            type="number"
            step="0.5"
            value={formData.pupillaryDistance.right}
            onChange={(e) => handlePDChange('right', e.target.value)}
          />
          <Input
            label="Distancia Izquierda"
            type="number"
            step="0.5"
            value={formData.pupillaryDistance.left}
            onChange={(e) => handlePDChange('left', e.target.value)}
          />
        </div>
      </Card>

      {/* Medidas del Armazón */}
      <Card>
        <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Medidas del Armazón</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Altura"
            type="number"
            step="0.5"
            value={formData.frameMeasurements.height}
            onChange={(e) => handleFrameChange('height', e.target.value)}
          />
          <Input
            label="Derecha"
            type="number"
            step="0.5"
            value={formData.frameMeasurements.right}
            onChange={(e) => handleFrameChange('right', e.target.value)}
          />
          <Input
            label="Izquierda"
            type="number"
            step="0.5"
            value={formData.frameMeasurements.left}
            onChange={(e) => handleFrameChange('left', e.target.value)}
          />
        </div>
      </Card>

      {/* Observaciones */}
      <Card>
        <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Observaciones</h2>
        <textarea
          value={formData.observations}
          onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
          placeholder="Notas adicionales sobre el examen..."
          className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:bg-theme-light-primary/40 hover:bg-theme-light-primary/40 transition-all duration-300 outline-none text-theme-primary-text placeholder:text-theme-secondary-text min-h-[100px] resize-y"
          rows={4}
        />
      </Card>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/clinical-exams')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : isEditing ? 'Actualizar Examen' : 'Crear Examen'}
        </Button>
      </div>
    </form>
  );
};
