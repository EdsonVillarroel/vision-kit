import { api } from '../../../lib/api';
import type { ClinicalExam, ClinicalExamFormData, EyeMeasurement } from '../types';

// ─── Tipo de respuesta plana del backend (Prisma columns) ────────────────────

interface BackendClinicalExam {
  id: string;
  examNumber: string;
  patientId: string;
  examinerId: string;
  medicalRecordId?: string;
  date: string;

  // Far vision right
  farRightSphere: number;
  farRightCylinder: number;
  farRightAxis: number;
  farRightPrism: number;
  farRightBase: string;
  farRightAddition?: number;

  // Far vision left
  farLeftSphere: number;
  farLeftCylinder: number;
  farLeftAxis: number;
  farLeftPrism: number;
  farLeftBase: string;
  farLeftAddition?: number;

  // Near vision right (optional)
  nearRightSphere?: number;
  nearRightCylinder?: number;
  nearRightAxis?: number;
  nearRightPrism?: number;
  nearRightBase?: string;

  // Near vision left (optional)
  nearLeftSphere?: number;
  nearLeftCylinder?: number;
  nearLeftAxis?: number;
  nearLeftPrism?: number;
  nearLeftBase?: string;

  // Pupillary distance
  pdRight: number;
  pdLeft: number;
  pdNearRight?: number;
  pdNearLeft?: number;

  // Frame measurements
  frameHeight: number;
  frameRight: number;
  frameLeft: number;

  lensDataRight?: string;
  lensDataLeft?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  patient?: { id: string; firstName: string; lastName: string };
  examiner?: { id: string; name: string };
}

// ─── Mapper backend → frontend ───────────────────────────────────────────────

function mapExam(b: BackendClinicalExam): ClinicalExam {
  const farRight: EyeMeasurement = {
    sphere: Number(b.farRightSphere),
    cylinder: Number(b.farRightCylinder),
    axis: b.farRightAxis,
    prism: Number(b.farRightPrism),
    base: b.farRightBase,
    addition: b.farRightAddition != null ? Number(b.farRightAddition) : undefined,
  };

  const farLeft: EyeMeasurement = {
    sphere: Number(b.farLeftSphere),
    cylinder: Number(b.farLeftCylinder),
    axis: b.farLeftAxis,
    prism: Number(b.farLeftPrism),
    base: b.farLeftBase,
    addition: b.farLeftAddition != null ? Number(b.farLeftAddition) : undefined,
  };

  const hasNearVision =
    b.nearRightSphere != null || b.nearLeftSphere != null;

  const nearRight: EyeMeasurement | undefined = hasNearVision
    ? {
        sphere: Number(b.nearRightSphere ?? 0),
        cylinder: Number(b.nearRightCylinder ?? 0),
        axis: b.nearRightAxis ?? 0,
        prism: Number(b.nearRightPrism ?? 0),
        base: b.nearRightBase ?? '',
      }
    : undefined;

  const nearLeft: EyeMeasurement | undefined = hasNearVision
    ? {
        sphere: Number(b.nearLeftSphere ?? 0),
        cylinder: Number(b.nearLeftCylinder ?? 0),
        axis: b.nearLeftAxis ?? 0,
        prism: Number(b.nearLeftPrism ?? 0),
        base: b.nearLeftBase ?? '',
      }
    : undefined;

  const hasNearPd = b.pdNearRight != null || b.pdNearLeft != null;

  return {
    id: b.id,
    examNumber: b.examNumber,
    patientId: b.patientId,
    patientName: b.patient
      ? `${b.patient.firstName} ${b.patient.lastName}`
      : '',
    date: b.date.split('T')[0],
    farVision: { right: farRight, left: farLeft },
    nearVision:
      hasNearVision && nearRight && nearLeft
        ? { right: nearRight, left: nearLeft }
        : undefined,
    pupillaryDistance: {
      right: Number(b.pdRight),
      left: Number(b.pdLeft),
      near: hasNearPd
        ? { right: Number(b.pdNearRight), left: Number(b.pdNearLeft) }
        : undefined,
    },
    frameMeasurements: {
      height: Number(b.frameHeight),
      right: Number(b.frameRight),
      left: Number(b.frameLeft),
    },
    lensData:
      b.lensDataRight || b.lensDataLeft
        ? { right: b.lensDataRight ?? '', left: b.lensDataLeft ?? '' }
        : undefined,
    observations: b.observations,
    examinerId: b.examinerId,
    examinerName: b.examiner?.name ?? '',
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

// ─── Mapper frontend form → body de la API ───────────────────────────────────

function buildRequestBody(data: ClinicalExamFormData) {
  return {
    patientId: data.patientId,
    date: data.date,
    farVision: {
      right: {
        sphere: data.farVision.right.sphere,
        cylinder: data.farVision.right.cylinder,
        axis: data.farVision.right.axis,
        prism: data.farVision.right.prism,
        base: data.farVision.right.base,
      },
      left: {
        sphere: data.farVision.left.sphere,
        cylinder: data.farVision.left.cylinder,
        axis: data.farVision.left.axis,
        prism: data.farVision.left.prism,
        base: data.farVision.left.base,
      },
    },
    nearVision: data.nearVision
      ? {
          right: {
            sphere: data.nearVision.right.sphere,
            cylinder: data.nearVision.right.cylinder,
            axis: data.nearVision.right.axis,
          },
          left: {
            sphere: data.nearVision.left.sphere,
            cylinder: data.nearVision.left.cylinder,
            axis: data.nearVision.left.axis,
          },
        }
      : undefined,
    pupillaryDistance: {
      right: data.pupillaryDistance.right,
      left: data.pupillaryDistance.left,
      nearRight: data.pupillaryDistance.near?.right,
      nearLeft: data.pupillaryDistance.near?.left,
    },
    frameMeasurements: {
      height: data.frameMeasurements.height,
      right: data.frameMeasurements.right,
      left: data.frameMeasurements.left,
    },
    lensDataRight: data.lensData?.right,
    lensDataLeft: data.lensData?.left,
    observations: data.observations,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const clinicalExamService = {
  async getAll(patientId?: string): Promise<ClinicalExam[]> {
    const qs = patientId ? `?patientId=${patientId}` : '';
    const data = await api.get<BackendClinicalExam[]>(`/clinical-exams${qs}`);
    return data.map(mapExam);
  },

  async getByPatient(patientId: string): Promise<ClinicalExam[]> {
    return clinicalExamService.getAll(patientId);
  },

  async getById(id: string): Promise<ClinicalExam> {
    const data = await api.get<BackendClinicalExam>(`/clinical-exams/${id}`);
    return mapExam(data);
  },

  async create(data: ClinicalExamFormData): Promise<ClinicalExam> {
    const result = await api.post<BackendClinicalExam>('/clinical-exams', buildRequestBody(data));
    return mapExam(result);
  },

  async update(id: string, data: Partial<ClinicalExamFormData>): Promise<ClinicalExam> {
    const result = await api.patch<BackendClinicalExam>(
      `/clinical-exams/${id}`,
      buildRequestBody(data as ClinicalExamFormData)
    );
    return mapExam(result);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/clinical-exams/${id}`);
  },

  async search(query: string): Promise<ClinicalExam[]> {
    const all = await clinicalExamService.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(
      (exam) =>
        exam.examNumber.toLowerCase().includes(lowerQuery) ||
        exam.patientName.toLowerCase().includes(lowerQuery)
    );
  },
};
