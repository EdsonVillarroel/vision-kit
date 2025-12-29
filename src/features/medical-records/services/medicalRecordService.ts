import type { MedicalRecord, MedicalRecordFormData } from '../types';

const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'MR001',
    patientId: '1',
    date: '2024-11-20',
    examType: 'routine',
    visualAcuity: {
      right: { uncorrected: '20/40', corrected: '20/20' },
      left: { uncorrected: '20/50', corrected: '20/20' }
    },
    refraction: {
      right: { sphere: -2.50, cylinder: -0.75, axis: 180, pd: 32 },
      left: { sphere: -2.75, cylinder: -0.50, axis: 175, pd: 32 }
    },
    prescription: {
      right: { sphere: -2.50, cylinder: -0.75, axis: 180, pd: 32 },
      left: { sphere: -2.75, cylinder: -0.50, axis: 175, pd: 32 },
      frameType: 'single',
      lensType: 'polycarbonate',
      coatings: ['anti-reflective', 'uv-protection', 'blue-light']
    },
    intraocularPressure: {
      right: 14,
      left: 15,
      unit: 'mmHg'
    },
    eyeHealth: {
      right: {
        anterior: 'Normal, córnea clara',
        posterior: 'Retina sana, nervio óptico normal',
        notes: 'Sin alteraciones'
      },
      left: {
        anterior: 'Normal, córnea clara',
        posterior: 'Retina sana, nervio óptico normal',
        notes: 'Sin alteraciones'
      }
    },
    diagnosis: ['Miopía leve bilateral', 'Astigmatismo'],
    notes: 'Paciente refiere fatiga visual al trabajar con computadora. Se recomienda uso de filtro luz azul.',
    nextVisitRecommended: '2025-11-20',
    practitioner: {
      id: 'OPT001',
      name: 'Dr. Carlos Ramírez'
    },
    createdAt: '2024-11-20T10:30:00Z',
    updatedAt: '2024-11-20T10:30:00Z'
  },
  {
    id: 'MR002',
    patientId: '2',
    date: '2024-12-01',
    examType: 'routine',
    visualAcuity: {
      right: { uncorrected: '20/20', corrected: '20/20' },
      left: { uncorrected: '20/25', corrected: '20/20' }
    },
    refraction: {
      right: { sphere: 0.00, cylinder: 0.00, axis: 0, pd: 31 },
      left: { sphere: -0.25, cylinder: 0.00, axis: 0, pd: 31 }
    },
    intraocularPressure: {
      right: 12,
      left: 13,
      unit: 'mmHg'
    },
    diagnosis: ['Emetropía OD', 'Miopía muy leve OI'],
    notes: 'Visión excelente. Control anual recomendado.',
    nextVisitRecommended: '2025-12-01',
    practitioner: {
      id: 'OPT002',
      name: 'Dra. María González'
    },
    createdAt: '2024-12-01T11:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z'
  },
  {
    id: 'MR003',
    patientId: '3',
    date: '2024-11-28',
    examType: 'routine',
    visualAcuity: {
      right: { uncorrected: '20/100', corrected: '20/25' },
      left: { uncorrected: '20/80', corrected: '20/25' }
    },
    refraction: {
      right: { sphere: -4.00, cylinder: -1.50, axis: 90, add: 2.00, pd: 33 },
      left: { sphere: -3.75, cylinder: -1.25, axis: 85, add: 2.00, pd: 33 }
    },
    prescription: {
      right: { sphere: -4.00, cylinder: -1.50, axis: 90, add: 2.00, pd: 33 },
      left: { sphere: -3.75, cylinder: -1.25, axis: 85, add: 2.00, pd: 33 },
      frameType: 'progressive',
      lensType: 'high-index',
      coatings: ['anti-reflective', 'scratch-resistant', 'uv-protection']
    },
    intraocularPressure: {
      right: 18,
      left: 17,
      unit: 'mmHg'
    },
    diagnosis: ['Miopía moderada bilateral', 'Astigmatismo', 'Presbicia'],
    notes: 'Paciente adaptándose bien a lentes progresivos. Presión intraocular en rango normal alto, monitorear.',
    nextVisitRecommended: '2025-05-28',
    practitioner: {
      id: 'OPT001',
      name: 'Dr. Carlos Ramírez'
    },
    createdAt: '2024-11-28T16:45:00Z',
    updatedAt: '2024-11-28T16:45:00Z'
  }
];

let records = [...MOCK_RECORDS];

export const medicalRecordService = {
  getAll: async (): Promise<MedicalRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...records]), 500);
    });
  },

  getByPatientId: async (patientId: string): Promise<MedicalRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patientRecords = records
          .filter(r => r.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(patientRecords);
      }, 400);
    });
  },

  getById: async (id: string): Promise<MedicalRecord | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const record = records.find(r => r.id === id);
        resolve(record || null);
      }, 300);
    });
  },

  create: async (data: MedicalRecordFormData): Promise<MedicalRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord: MedicalRecord = {
          ...data,
          id: `MR${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        records.push(newRecord);
        resolve(newRecord);
      }, 600);
    });
  },

  update: async (id: string, data: Partial<MedicalRecordFormData>): Promise<MedicalRecord> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = records.findIndex(r => r.id === id);
        if (index === -1) {
          reject(new Error('Medical record not found'));
          return;
        }

        records[index] = {
          ...records[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        resolve(records[index]);
      }, 600);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = records.findIndex(r => r.id === id);
        if (index === -1) {
          reject(new Error('Medical record not found'));
          return;
        }
        records.splice(index, 1);
        resolve();
      }, 400);
    });
  },

  getLatestByPatientId: async (patientId: string): Promise<MedicalRecord | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patientRecords = records
          .filter(r => r.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(patientRecords[0] || null);
      }, 300);
    });
  }
};
