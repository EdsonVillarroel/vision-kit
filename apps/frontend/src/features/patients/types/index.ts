export type PatientStatus = 'frequent' | 'warning' | 'normal';

export interface Patient {
  id: string;
  identificationId: string; // Cédula de identidad
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies?: string[];
  medicalConditions?: string[];
  // Estado del cliente
  status: PatientStatus; // 'frequent' = cliente frecuente (verde), 'warning' = alerta/conflicto (amarillo), 'normal' = normal
  visitCount: number; // Número de visitas
  totalSpent: number; // Total gastado (para determinar si es frecuente)
  notes?: string; // Notas internas sobre el cliente (conflictos, preferencias, etc.)
  warningReason?: string; // Razón de la alerta (si status = 'warning')
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
}

export interface PatientFormData extends Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'visitCount' | 'totalSpent' | 'status' | 'lastVisit'> {}

export interface PatientFilters {
  search?: string;
  identificationId?: string; // Búsqueda por cédula
  gender?: string;
  hasInsurance?: boolean;
  status?: PatientStatus; // Filtrar por estado
}
