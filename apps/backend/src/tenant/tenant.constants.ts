export const TENANT_ID_KEY = 'tenantId';

// Modelos Prisma con tenant_id (PascalCase como los usa Prisma internamente)
export const TENANT_SCOPED_MODELS = new Set([
  'User',
  'Patient',
  'PatientInsurance',
  'PatientEmergencyContact',
  'Appointment',
  'MedicalRecord',
  'ClinicalExam',
  'Product',
  'ProductSpecification',
  'ProductSupplier',
  'StockMovement',
  'Sale',
  'SaleItem',
  'Payment',
  'ClinicSettings',
  'PublicBooking',
]);
