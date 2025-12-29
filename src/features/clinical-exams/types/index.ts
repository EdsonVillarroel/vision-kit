// Tipos de examen clínico
export type EyeSide = 'right' | 'left';

export interface EyeMeasurement {
  sphere: number;
  cylinder: number;
  axis: number;
  prism: number;
  base: string;
  addition?: number;
}

export interface PupillaryDistance {
  right: number;
  left: number;
  near?: {
    right: number;
    left: number;
  };
}

export interface FrameMeasurements {
  height: number;
  right: number;
  left: number;
}

export interface ClinicalExam {
  id: string;
  patientId: string;
  patientName: string;
  examNumber: string;
  date: string;

  // Mediciones ojos
  farVision: {
    right: EyeMeasurement;
    left: EyeMeasurement;
  };

  nearVision?: {
    right: EyeMeasurement;
    left: EyeMeasurement;
  };

  // Distancias pupilares
  pupillaryDistance: PupillaryDistance;

  // Mediciones del armazón
  frameMeasurements: FrameMeasurements;

  // Datos adicionales del lente
  lensData?: {
    right: string;
    left: string;
  };

  // Observaciones
  observations?: string;

  // Profesional que realizó el examen
  examinerId: string;
  examinerName: string;

  createdAt: string;
  updatedAt: string;
}

export interface ClinicalExamFormData {
  patientId: string;
  examNumber?: string;
  date: string;

  farVision: {
    right: EyeMeasurement;
    left: EyeMeasurement;
  };

  nearVision?: {
    right: EyeMeasurement;
    left: EyeMeasurement;
  };

  pupillaryDistance: PupillaryDistance;
  frameMeasurements: FrameMeasurements;
  lensData?: {
    right: string;
    left: string;
  };

  observations?: string;
  examinerId: string;
}
