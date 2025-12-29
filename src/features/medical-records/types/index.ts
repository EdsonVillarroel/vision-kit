export interface EyeMeasurement {
  sphere: number;
  cylinder: number;
  axis: number;
  add?: number; // Para lentes bifocales/progresivos
  prism?: number;
  base?: 'up' | 'down' | 'in' | 'out';
  pd?: number; // Distancia pupilar
}

export interface VisualAcuity {
  uncorrected: string; // Ej: "20/40"
  corrected: string; // Ej: "20/20"
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  examType: 'routine' | 'emergency' | 'followup' | 'contact-lens';

  // Agudeza visual
  visualAcuity: {
    right: VisualAcuity;
    left: VisualAcuity;
  };

  // Refracción
  refraction: {
    right: EyeMeasurement;
    left: EyeMeasurement;
  };

  // Prescripción (puede diferir de la refracción)
  prescription?: {
    right: EyeMeasurement;
    left: EyeMeasurement;
    frameType?: 'single' | 'bifocal' | 'progressive';
    lensType?: 'plastic' | 'polycarbonate' | 'high-index' | 'glass';
    coatings?: ('anti-reflective' | 'scratch-resistant' | 'uv-protection' | 'blue-light')[];
  };

  // Presión intraocular
  intraocularPressure?: {
    right: number;
    left: number;
    unit: 'mmHg';
  };

  // Examen de salud ocular
  eyeHealth?: {
    right: {
      anterior: string; // Segmento anterior
      posterior: string; // Segmento posterior
      notes?: string;
    };
    left: {
      anterior: string;
      posterior: string;
      notes?: string;
    };
  };

  // Diagnóstico
  diagnosis: string[];

  // Notas del optometrista
  notes?: string;

  // Próxima cita recomendada
  nextVisitRecommended?: string;

  // Profesional que atendió
  practitioner: {
    id: string;
    name: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordFormData extends Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'> {}

export type ExamType = 'routine' | 'emergency' | 'followup' | 'contact-lens';

export interface MedicalRecordFilters {
  patientId?: string;
  examType?: string;
  dateFrom?: string;
  dateTo?: string;
  practitionerId?: string;
}
