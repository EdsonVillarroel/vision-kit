import type { Patient, PatientFormData } from '../types';

// Mock data
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    identificationId: '12345678-9', // Cliente frecuente
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    phone: '555-0101',
    email: 'juan.perez@email.com',
    address: 'Calle Principal 123',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '01000',
    insurance: {
      provider: 'Seguro Popular',
      policyNumber: 'SP-123456',
      groupNumber: 'GP-001'
    },
    emergencyContact: {
      name: 'María Pérez',
      relationship: 'Esposa',
      phone: '555-0102'
    },
    allergies: ['Penicilina'],
    medicalConditions: ['Diabetes tipo 2'],
    status: 'frequent',
    visitCount: 15,
    totalSpent: 25000,
    notes: 'Cliente muy leal, prefiere lentes Ray-Ban',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-11-20T14:30:00Z',
    lastVisit: '2024-11-20'
  },
  {
    id: '2',
    identificationId: '98765432-1', // Cliente normal
    firstName: 'Ana',
    lastName: 'García',
    dateOfBirth: '1992-08-22',
    gender: 'female',
    phone: '555-0201',
    email: 'ana.garcia@email.com',
    address: 'Avenida Reforma 456',
    city: 'Guadalajara',
    state: 'Jalisco',
    zipCode: '44100',
    emergencyContact: {
      name: 'Carlos García',
      relationship: 'Padre',
      phone: '555-0202'
    },
    status: 'normal',
    visitCount: 3,
    totalSpent: 4500,
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z',
    lastVisit: '2024-12-01'
  },
  {
    id: '3',
    identificationId: '55566677-8', // Cliente con alerta
    firstName: 'Roberto',
    lastName: 'Martínez',
    dateOfBirth: '1978-12-03',
    gender: 'male',
    phone: '555-0301',
    address: 'Boulevard Centro 789',
    city: 'Monterrey',
    state: 'Nuevo León',
    zipCode: '64000',
    insurance: {
      provider: 'IMSS',
      policyNumber: 'IMSS-789012'
    },
    emergencyContact: {
      name: 'Laura Martínez',
      relationship: 'Hermana',
      phone: '555-0302'
    },
    medicalConditions: ['Hipertensión'],
    status: 'warning',
    visitCount: 7,
    totalSpent: 8900,
    warningReason: 'Solicitó reembolso en última compra por ajuste incorrecto de lentes. Revisar historial antes de nueva venta.',
    notes: 'Requiere mediciones extra precisas, sensible a ajustes de montura',
    createdAt: '2023-06-20T15:00:00Z',
    updatedAt: '2024-11-28T16:45:00Z',
    lastVisit: '2024-11-28'
  },
  {
    id: '4',
    identificationId: '11223344-5', // Cliente frecuente
    firstName: 'María',
    lastName: 'López',
    dateOfBirth: '1990-03-10',
    gender: 'female',
    phone: '555-0401',
    email: 'maria.lopez@email.com',
    address: 'Calle Juárez 321',
    city: 'Puebla',
    state: 'Puebla',
    zipCode: '72000',
    emergencyContact: {
      name: 'José López',
      relationship: 'Esposo',
      phone: '555-0402'
    },
    status: 'frequent',
    visitCount: 12,
    totalSpent: 18500,
    notes: 'Prefiere lentes de contacto desechables, compra cada mes',
    createdAt: '2023-02-05T12:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
    lastVisit: '2024-12-05'
  }
];

let patients = [...MOCK_PATIENTS];

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...patients]), 500);
    });
  },

  getById: async (id: string): Promise<Patient | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = patients.find(p => p.id === id);
        resolve(patient || null);
      }, 300);
    });
  },

  search: async (query: string): Promise<Patient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = patients.filter(p =>
          p.firstName.toLowerCase().includes(lowerQuery) ||
          p.lastName.toLowerCase().includes(lowerQuery) ||
          p.phone.includes(query) ||
          p.email?.toLowerCase().includes(lowerQuery) ||
          p.identificationId.includes(query)
        );
        resolve(results);
      }, 400);
    });
  },

  // Búsqueda específica por cédula
  searchByIdentificationId: async (identificationId: string): Promise<Patient | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = patients.find(p => p.identificationId === identificationId);
        resolve(patient || null);
      }, 300);
    });
  },

  create: async (data: PatientFormData): Promise<Patient> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validar que la cédula no exista
        const existingPatient = patients.find(p => p.identificationId === data.identificationId);
        if (existingPatient) {
          reject(new Error('Ya existe un paciente con esta cédula de identidad'));
          return;
        }

        const newPatient: Patient = {
          ...data,
          id: `P${Date.now()}`,
          visitCount: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        patients.push(newPatient);
        resolve(newPatient);
      }, 600);
    });
  },

  update: async (id: string, data: Partial<PatientFormData>): Promise<Patient> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = patients.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Patient not found'));
          return;
        }

        patients[index] = {
          ...patients[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        resolve(patients[index]);
      }, 600);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = patients.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Patient not found'));
          return;
        }
        patients.splice(index, 1);
        resolve();
      }, 400);
    });
  },

  // Registrar una compra y actualizar el estado del cliente
  recordPurchase: async (id: string, amount: number): Promise<Patient> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = patients.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Patient not found'));
          return;
        }

        const patient = patients[index];
        const newVisitCount = patient.visitCount + 1;
        const newTotalSpent = patient.totalSpent + amount;

        // Determinar nuevo estado basado en actividad
        let newStatus = patient.status;
        if (patient.status !== 'warning') { // No cambiar si tiene alerta
          if (newVisitCount >= 10 || newTotalSpent >= 15000) {
            newStatus = 'frequent';
          } else {
            newStatus = 'normal';
          }
        }

        patients[index] = {
          ...patient,
          visitCount: newVisitCount,
          totalSpent: newTotalSpent,
          status: newStatus,
          lastVisit: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString()
        };

        resolve(patients[index]);
      }, 400);
    });
  },

  // Actualizar estado del cliente (para marcar alertas/conflictos)
  updateStatus: async (
    id: string,
    status: 'frequent' | 'warning' | 'normal',
    warningReason?: string,
    notes?: string
  ): Promise<Patient> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = patients.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Patient not found'));
          return;
        }

        patients[index] = {
          ...patients[index],
          status,
          warningReason: status === 'warning' ? warningReason : undefined,
          notes: notes || patients[index].notes,
          updatedAt: new Date().toISOString()
        };

        resolve(patients[index]);
      }, 400);
    });
  }
};
