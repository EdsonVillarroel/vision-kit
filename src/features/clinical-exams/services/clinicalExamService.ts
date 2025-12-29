import type { ClinicalExam, ClinicalExamFormData } from '../types';

// Mock data
let mockExams: ClinicalExam[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Juan Pérez',
    examNumber: 'ELB5091',
    date: '2024-01-15',
    farVision: {
      right: {
        sphere: -1.00,
        cylinder: -5.00,
        axis: 175,
        prism: 0,
        base: ''
      },
      left: {
        sphere: -0.75,
        cylinder: -5.75,
        axis: 170,
        prism: 0,
        base: ''
      }
    },
    nearVision: {
      right: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        prism: 0,
        base: ''
      },
      left: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        prism: 0,
        base: ''
      }
    },
    pupillaryDistance: {
      right: 32.50,
      left: 32.50
    },
    frameMeasurements: {
      height: 0,
      right: 0,
      left: 0
    },
    examinerId: '1',
    examinerName: 'Dr. García',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const clinicalExamService = {
  // Obtener todos los exámenes
  async getAll(): Promise<ClinicalExam[]> {
    await delay(500);
    return [...mockExams].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Obtener exámenes por paciente
  async getByPatient(patientId: string): Promise<ClinicalExam[]> {
    await delay(500);
    return mockExams
      .filter(exam => exam.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Obtener un examen por ID
  async getById(id: string): Promise<ClinicalExam> {
    await delay(500);
    const exam = mockExams.find(e => e.id === id);
    if (!exam) {
      throw new Error('Examen clínico no encontrado');
    }
    return exam;
  },

  // Crear examen
  async create(data: ClinicalExamFormData): Promise<ClinicalExam> {
    await delay(800);

    const newExam: ClinicalExam = {
      id: String(mockExams.length + 1),
      ...data,
      patientName: 'Nombre del Paciente', // Se debe obtener del servicio de pacientes
      examNumber: data.examNumber || `EXM${String(mockExams.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      examinerName: 'Nombre del Examinador' // Se debe obtener del usuario actual
    };

    mockExams.push(newExam);
    return newExam;
  },

  // Actualizar examen
  async update(id: string, data: Partial<ClinicalExamFormData>): Promise<ClinicalExam> {
    await delay(800);

    const index = mockExams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Examen clínico no encontrado');
    }

    mockExams[index] = {
      ...mockExams[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    return mockExams[index];
  },

  // Eliminar examen
  async delete(id: string): Promise<void> {
    await delay(500);
    const index = mockExams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Examen clínico no encontrado');
    }
    mockExams.splice(index, 1);
  },

  // Buscar exámenes
  async search(query: string): Promise<ClinicalExam[]> {
    await delay(500);
    const lowerQuery = query.toLowerCase();
    return mockExams.filter(exam =>
      exam.examNumber.toLowerCase().includes(lowerQuery) ||
      exam.patientName.toLowerCase().includes(lowerQuery)
    );
  }
};
