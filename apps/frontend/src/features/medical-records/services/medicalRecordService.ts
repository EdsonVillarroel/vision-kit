import { api } from '../../../lib/api';
import type { MedicalRecord, MedicalRecordFormData, EyeMeasurement } from '../types';

// ─── Tipos de respuesta plana del backend (Prisma columns) ───────────────────

interface BackendMedicalRecord {
  id: string;
  patientId: string;
  practitionerId: string;
  date: string;
  examType: 'routine' | 'emergency' | 'followup' | 'contact_lens';

  // Visual acuity
  vaRightUncorrected: string;
  vaRightCorrected: string;
  vaLeftUncorrected: string;
  vaLeftCorrected: string;

  // Refraction right
  refractionRightSphere: number;
  refractionRightCylinder: number;
  refractionRightAxis: number;
  refractionRightAdd?: number;
  refractionRightPrism?: number;
  refractionRightBase?: string;
  refractionRightPd?: number;

  // Refraction left
  refractionLeftSphere: number;
  refractionLeftCylinder: number;
  refractionLeftAxis: number;
  refractionLeftAdd?: number;
  refractionLeftPrism?: number;
  refractionLeftBase?: string;
  refractionLeftPd?: number;

  // Prescription right (optional)
  prescriptionRightSphere?: number;
  prescriptionRightCylinder?: number;
  prescriptionRightAxis?: number;
  prescriptionRightAdd?: number;
  prescriptionRightPd?: number;

  // Prescription left (optional)
  prescriptionLeftSphere?: number;
  prescriptionLeftCylinder?: number;
  prescriptionLeftAxis?: number;
  prescriptionLeftAdd?: number;
  prescriptionLeftPd?: number;
  prescriptionFrameType?: string;
  prescriptionLensType?: string;

  // IOP (optional)
  iopRight?: number;
  iopLeft?: number;

  // Eye health (optional)
  eyeHealthRightAnterior?: string;
  eyeHealthRightPosterior?: string;
  eyeHealthRightNotes?: string;
  eyeHealthLeftAnterior?: string;
  eyeHealthLeftPosterior?: string;
  eyeHealthLeftNotes?: string;

  diagnosis: string[];
  notes?: string;
  nextVisitRecommended?: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  practitioner?: { id: string; name: string };
}

// ─── Mapper backend → frontend ───────────────────────────────────────────────

function mapRecord(b: BackendMedicalRecord): MedicalRecord {
  const examType =
    b.examType === 'contact_lens' ? 'contact-lens' : (b.examType as MedicalRecord['examType']);

  const refractionRight: EyeMeasurement = {
    sphere: Number(b.refractionRightSphere),
    cylinder: Number(b.refractionRightCylinder),
    axis: b.refractionRightAxis,
    add: b.refractionRightAdd != null ? Number(b.refractionRightAdd) : undefined,
    prism: b.refractionRightPrism != null ? Number(b.refractionRightPrism) : undefined,
    pd: b.refractionRightPd != null ? Number(b.refractionRightPd) : undefined,
  };

  const refractionLeft: EyeMeasurement = {
    sphere: Number(b.refractionLeftSphere),
    cylinder: Number(b.refractionLeftCylinder),
    axis: b.refractionLeftAxis,
    add: b.refractionLeftAdd != null ? Number(b.refractionLeftAdd) : undefined,
    prism: b.refractionLeftPrism != null ? Number(b.refractionLeftPrism) : undefined,
    pd: b.refractionLeftPd != null ? Number(b.refractionLeftPd) : undefined,
  };

  const hasPrescription =
    b.prescriptionRightSphere != null || b.prescriptionLeftSphere != null;

  const hasIop = b.iopRight != null || b.iopLeft != null;

  const hasEyeHealth =
    b.eyeHealthRightAnterior || b.eyeHealthLeftAnterior;

  return {
    id: b.id,
    patientId: b.patientId,
    date: b.date.split('T')[0],
    examType,
    visualAcuity: {
      right: { uncorrected: b.vaRightUncorrected, corrected: b.vaRightCorrected },
      left: { uncorrected: b.vaLeftUncorrected, corrected: b.vaLeftCorrected },
    },
    refraction: { right: refractionRight, left: refractionLeft },
    prescription: hasPrescription
      ? {
          right: {
            sphere: Number(b.prescriptionRightSphere ?? 0),
            cylinder: Number(b.prescriptionRightCylinder ?? 0),
            axis: b.prescriptionRightAxis ?? 0,
            add: b.prescriptionRightAdd != null ? Number(b.prescriptionRightAdd) : undefined,
            pd: b.prescriptionRightPd != null ? Number(b.prescriptionRightPd) : undefined,
          },
          left: {
            sphere: Number(b.prescriptionLeftSphere ?? 0),
            cylinder: Number(b.prescriptionLeftCylinder ?? 0),
            axis: b.prescriptionLeftAxis ?? 0,
            add: b.prescriptionLeftAdd != null ? Number(b.prescriptionLeftAdd) : undefined,
            pd: b.prescriptionLeftPd != null ? Number(b.prescriptionLeftPd) : undefined,
          },
        }
      : undefined,
    intraocularPressure: hasIop
      ? { right: b.iopRight!, left: b.iopLeft!, unit: 'mmHg' }
      : undefined,
    eyeHealth:
      hasEyeHealth
        ? {
            right: {
              anterior: b.eyeHealthRightAnterior ?? '',
              posterior: b.eyeHealthRightPosterior ?? '',
              notes: b.eyeHealthRightNotes,
            },
            left: {
              anterior: b.eyeHealthLeftAnterior ?? '',
              posterior: b.eyeHealthLeftPosterior ?? '',
              notes: b.eyeHealthLeftNotes,
            },
          }
        : undefined,
    diagnosis: b.diagnosis,
    notes: b.notes,
    nextVisitRecommended: b.nextVisitRecommended
      ? b.nextVisitRecommended.split('T')[0]
      : undefined,
    practitioner: b.practitioner ?? { id: b.practitionerId, name: '' },
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

// ─── Mapper frontend form → body de la API ───────────────────────────────────

function buildRequestBody(data: MedicalRecordFormData) {
  return {
    patientId: data.patientId,
    date: data.date,
    examType: data.examType === 'contact-lens' ? 'contact_lens' : data.examType,
    visualAcuity: data.visualAcuity,
    refraction: data.refraction,
    prescription: data.prescription,
    intraocularPressure: data.intraocularPressure
      ? {
          right: data.intraocularPressure.right,
          left: data.intraocularPressure.left,
        }
      : undefined,
    eyeHealth: data.eyeHealth,
    diagnosis: data.diagnosis,
    notes: data.notes,
    nextVisitRecommended: data.nextVisitRecommended,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const medicalRecordService = {
  getAll: async (patientId?: string): Promise<MedicalRecord[]> => {
    const qs = patientId ? `?patientId=${patientId}` : '';
    const data = await api.get<BackendMedicalRecord[]>(`/medical-records${qs}`);
    return data.map(mapRecord);
  },

  getByPatientId: async (patientId: string): Promise<MedicalRecord[]> => {
    return medicalRecordService.getAll(patientId);
  },

  getById: async (id: string): Promise<MedicalRecord | null> => {
    try {
      const data = await api.get<BackendMedicalRecord>(`/medical-records/${id}`);
      return mapRecord(data);
    } catch {
      return null;
    }
  },

  create: async (data: MedicalRecordFormData): Promise<MedicalRecord> => {
    const result = await api.post<BackendMedicalRecord>('/medical-records', buildRequestBody(data));
    return mapRecord(result);
  },

  update: async (id: string, data: Partial<MedicalRecordFormData>): Promise<MedicalRecord> => {
    const result = await api.patch<BackendMedicalRecord>(
      `/medical-records/${id}`,
      buildRequestBody(data as MedicalRecordFormData)
    );
    return mapRecord(result);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/medical-records/${id}`);
  },

  getLatestByPatientId: async (patientId: string): Promise<MedicalRecord | null> => {
    const records = await medicalRecordService.getByPatientId(patientId);
    return records.length > 0 ? records[0] : null;
  },
};
