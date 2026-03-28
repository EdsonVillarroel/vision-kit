# Vision Kit — Database Structure

> **MANTENIMIENTO:** Actualizar este archivo cada vez que se modifique `apps/backend/prisma/schema.prisma`:
> nuevo modelo, nuevo campo, nueva relación, nuevo enum, índice nuevo.
> El schema en `prisma/schema.prisma` es la fuente de verdad — este doc debe reflejarlo siempre.

Base de datos relacional diseñada para PostgreSQL con Prisma ORM.
Refleja todos los tipos TypeScript del frontend y sus relaciones.

---

## Diagrama de Entidades (ERD)

```
User ──────────────────────────────────────────────────────────┐
 │                                                              │
 ├─< Appointment (practitioner)                                 │
 ├─< Sale (soldBy)                                              │
 ├─< MedicalRecord (practitioner)                               │
 └─< ClinicalExam (examiner)                                    │
                                                                │
Patient ────────────────────────────────────────────────────┐  │
 ├─< Appointment                                             │  │
 ├─< MedicalRecord                                          │  │
 ├─< ClinicalExam                                           │  │
 ├─< Sale                                                   │  │
 ├─< PatientInsurance (1:1)                                 │  │
 └─< PatientEmergencyContact (1:1)                          │  │
                                                            │  │
Sale ────────────────────────────────────────────────────┐  │  │
 ├─< SaleItem >── Product                                │  │  │
 ├─< Payment                                             │  │  │
 └── MedicalRecord (opcional)                            │  │  │
                                                         │  │  │
Product ─────────────────────────────────────────────┐  │  │  │
 ├─< StockMovement                                    │  │  │  │
 └─< ProductSpecification (1:1)                       │  │  │  │
                                                      │  │  │  │
MedicalRecord ─── ClinicalExam (opcional)             │  │  │  │
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// USERS & AUTH
// ─────────────────────────────────────────

enum UserRole {
  admin
  manager
  optician
}

enum UserStatus {
  active
  inactive
}

model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  name      String
  role      UserRole   @default(optician)
  avatar    String?
  phone     String?
  status    UserStatus @default(active)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relaciones
  appointments   Appointment[]
  sales          Sale[]
  medicalRecords MedicalRecord[]
  clinicalExams  ClinicalExam[]
  stockMovements StockMovement[]

  @@map("users")
}

// ─────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────

enum PatientGender {
  male
  female
  other
}

enum PatientStatus {
  frequent
  normal
  warning
}

model Patient {
  id               String        @id @default(uuid())
  identificationId String        @unique   // Cédula / ID nacional
  firstName        String
  lastName         String
  dateOfBirth      DateTime
  gender           PatientGender
  phone            String
  email            String?
  address          String
  city             String
  state            String
  zipCode          String
  allergies        String[]      @default([])
  medicalConditions String[]     @default([])
  status           PatientStatus @default(normal)
  visitCount       Int           @default(0)
  totalSpent       Decimal       @default(0) @db.Decimal(10, 2)
  notes            String?
  warningReason    String?
  lastVisit        DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  // Relaciones
  insurance        PatientInsurance?
  emergencyContact PatientEmergencyContact?
  appointments     Appointment[]
  medicalRecords   MedicalRecord[]
  clinicalExams    ClinicalExam[]
  sales            Sale[]

  @@map("patients")
}

model PatientInsurance {
  id            String  @id @default(uuid())
  patientId     String  @unique
  provider      String
  policyNumber  String
  groupNumber   String?

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("patient_insurances")
}

model PatientEmergencyContact {
  id           String @id @default(uuid())
  patientId    String @unique
  name         String
  relationship String
  phone        String

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("patient_emergency_contacts")
}

// ─────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────

enum AppointmentType {
  eye_exam           // "eye-exam"
  contact_lens_fitting // "contact-lens-fitting"
  followup
  emergency
  frame_selection    // "frame-selection"
  adjustment
}

enum AppointmentStatus {
  scheduled
  confirmed
  in_progress  // "in-progress"
  completed
  cancelled
  no_show      // "no-show"
}

model Appointment {
  id                 String            @id @default(uuid())
  appointmentNumber  String            @unique  // e.g. "APT-2024-001"
  patientId          String
  practitionerId     String
  date               DateTime          @db.Date
  time               String            // "HH:MM"
  duration           Int               @default(30)  // minutos
  endTime            String            // "HH:MM"
  type               AppointmentType
  status             AppointmentStatus @default(scheduled)
  reason             String?
  notes              String?
  reminderSent       Boolean           @default(false)
  reminderSentAt     DateTime?
  medicalRecordId    String?
  createdById        String
  confirmedAt        DateTime?
  completedAt        DateTime?
  cancelledAt        DateTime?
  cancellationReason String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  // Relaciones
  patient       Patient        @relation(fields: [patientId], references: [id])
  practitioner  User           @relation(fields: [practitionerId], references: [id])
  medicalRecord MedicalRecord? @relation(fields: [medicalRecordId], references: [id])

  @@map("appointments")
}

// ─────────────────────────────────────────
// MEDICAL RECORDS
// ─────────────────────────────────────────

enum ExamType {
  routine
  emergency
  followup
  contact_lens  // "contact-lens"
}

model MedicalRecord {
  id                    String    @id @default(uuid())
  patientId             String
  practitionerId        String
  date                  DateTime  @db.Date
  examType              ExamType  @default(routine)

  // Agudeza visual (Visual Acuity)
  vaRightUncorrected    String    // "20/40"
  vaRightCorrected      String    // "20/20"
  vaLeftUncorrected     String
  vaLeftCorrected       String

  // Refracción
  refractionRightSphere   Decimal @db.Decimal(5, 2)
  refractionRightCylinder Decimal @db.Decimal(5, 2)
  refractionRightAxis     Int
  refractionRightAdd      Decimal? @db.Decimal(5, 2)
  refractionRightPrism    Decimal? @db.Decimal(5, 2)
  refractionRightBase     String?
  refractionRightPd       Decimal? @db.Decimal(4, 1)

  refractionLeftSphere    Decimal @db.Decimal(5, 2)
  refractionLeftCylinder  Decimal @db.Decimal(5, 2)
  refractionLeftAxis      Int
  refractionLeftAdd       Decimal? @db.Decimal(5, 2)
  refractionLeftPrism     Decimal? @db.Decimal(5, 2)
  refractionLeftBase      String?
  refractionLeftPd        Decimal? @db.Decimal(4, 1)

  // Prescripción (opcional, puede ser igual o diferente a refracción)
  prescriptionRightSphere   Decimal? @db.Decimal(5, 2)
  prescriptionRightCylinder Decimal? @db.Decimal(5, 2)
  prescriptionRightAxis     Int?
  prescriptionRightAdd      Decimal? @db.Decimal(5, 2)
  prescriptionRightPd       Decimal? @db.Decimal(4, 1)
  prescriptionLeftSphere    Decimal? @db.Decimal(5, 2)
  prescriptionLeftCylinder  Decimal? @db.Decimal(5, 2)
  prescriptionLeftAxis      Int?
  prescriptionLeftAdd       Decimal? @db.Decimal(5, 2)
  prescriptionLeftPd        Decimal? @db.Decimal(4, 1)
  prescriptionFrameType     String?  // "full-rim", "semi-rimless", "rimless"
  prescriptionLensType      String?  // "single", "bifocal", "progressive"

  // Presión intraocular (opcional)
  iopRight                  Int?      // mmHg
  iopLeft                   Int?

  // Salud ocular (opcional)
  eyeHealthRightAnterior    String?
  eyeHealthRightPosterior   String?
  eyeHealthRightNotes       String?
  eyeHealthLeftAnterior     String?
  eyeHealthLeftPosterior    String?
  eyeHealthLeftNotes        String?

  diagnosis               String[]  @default([])
  notes                   String?
  nextVisitRecommended    DateTime? @db.Date

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  patient       Patient      @relation(fields: [patientId], references: [id])
  practitioner  User         @relation(fields: [practitionerId], references: [id])
  appointments  Appointment[]
  sales         Sale[]
  clinicalExam  ClinicalExam?

  @@map("medical_records")
}

// ─────────────────────────────────────────
// CLINICAL EXAMS (Exámenes clínicos refractivos)
// ─────────────────────────────────────────

model ClinicalExam {
  id            String   @id @default(uuid())
  examNumber    String   @unique  // e.g. "EXM-2024-001"
  patientId     String
  examinerId    String
  medicalRecordId String? @unique
  date          DateTime @db.Date

  // Visión lejana — Ojo derecho
  farRightSphere   Decimal @db.Decimal(5, 2)
  farRightCylinder Decimal @db.Decimal(5, 2)
  farRightAxis     Int
  farRightPrism    Decimal @default(0) @db.Decimal(5, 2)
  farRightBase     String  @default("")
  farRightAddition Decimal? @db.Decimal(5, 2)

  // Visión lejana — Ojo izquierdo
  farLeftSphere    Decimal @db.Decimal(5, 2)
  farLeftCylinder  Decimal @db.Decimal(5, 2)
  farLeftAxis      Int
  farLeftPrism     Decimal @default(0) @db.Decimal(5, 2)
  farLeftBase      String  @default("")
  farLeftAddition  Decimal? @db.Decimal(5, 2)

  // Visión cercana — Ojo derecho (opcional)
  nearRightSphere   Decimal? @db.Decimal(5, 2)
  nearRightCylinder Decimal? @db.Decimal(5, 2)
  nearRightAxis     Int?
  nearRightPrism    Decimal? @db.Decimal(5, 2)
  nearRightBase     String?

  // Visión cercana — Ojo izquierdo (opcional)
  nearLeftSphere    Decimal? @db.Decimal(5, 2)
  nearLeftCylinder  Decimal? @db.Decimal(5, 2)
  nearLeftAxis      Int?
  nearLeftPrism     Decimal? @db.Decimal(5, 2)
  nearLeftBase      String?

  // Distancia pupilar
  pdRight          Decimal  @db.Decimal(4, 1)
  pdLeft           Decimal  @db.Decimal(4, 1)
  pdNearRight      Decimal? @db.Decimal(4, 1)
  pdNearLeft       Decimal? @db.Decimal(4, 1)

  // Medidas de armazón
  frameHeight      Decimal  @db.Decimal(5, 1)
  frameRight       Decimal  @db.Decimal(5, 1)
  frameLeft        Decimal  @db.Decimal(5, 1)

  // Datos de lentes (notas libres)
  lensDataRight    String?
  lensDataLeft     String?

  observations     String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relaciones
  patient       Patient        @relation(fields: [patientId], references: [id])
  examiner      User           @relation(fields: [examinerId], references: [id])
  medicalRecord MedicalRecord? @relation(fields: [medicalRecordId], references: [id])

  @@map("clinical_exams")
}

// ─────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────

enum ProductCategory {
  frames
  lenses
  sunglasses
  contact_lenses  // "contact-lenses"
  accessories
  solutions
}

enum ProductStatus {
  in_stock     // "in-stock"
  low_stock    // "low-stock"
  out_of_stock // "out-of-stock"
  discontinued
}

model Product {
  id           String          @id @default(uuid())
  sku          String          @unique
  name         String
  category     ProductCategory
  brand        String
  model        String?
  costPrice    Decimal         @db.Decimal(10, 2)
  sellingPrice Decimal         @db.Decimal(10, 2)
  discount     Decimal?        @db.Decimal(5, 2)  // porcentaje
  stock        Int             @default(0)
  minStock     Int             @default(5)
  maxStock     Int?
  status       ProductStatus   @default(in_stock)
  images       String[]        @default([])
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  // Relaciones
  specifications ProductSpecification?
  supplier       ProductSupplier?
  stockMovements StockMovement[]
  saleItems      SaleItem[]

  @@map("products")
}

model ProductSpecification {
  id         String  @id @default(uuid())
  productId  String  @unique

  // Frames / Sunglasses
  frameType  String?   // "full-rim" | "semi-rimless" | "rimless"
  material   String?
  color      String?
  lensSize   Decimal?  @db.Decimal(4, 1)   // mm
  bridge     Decimal?  @db.Decimal(4, 1)   // mm
  temple     Decimal?  @db.Decimal(5, 1)   // mm

  // Lenses
  lensType     String?   // "single" | "bifocal" | "progressive"
  lensMaterial String?
  index        Decimal?  @db.Decimal(3, 2)  // 1.50, 1.67, etc.
  coatings     String[]  @default([])

  // Contact lenses
  baseCurve  Decimal?  @db.Decimal(4, 2)
  diameter   Decimal?  @db.Decimal(4, 1)
  power      String?

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_specifications")
}

model ProductSupplier {
  id        String  @id @default(uuid())
  productId String  @unique
  name      String
  contact   String?
  email     String?
  phone     String?

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_suppliers")
}

enum StockMovementType {
  in
  out
  adjustment
}

model StockMovement {
  id            String            @id @default(uuid())
  productId     String
  performedById String
  type          StockMovementType
  quantity      Int
  previousStock Int
  newStock      Int
  reason        String
  reference     String?           // número de venta, orden, etc.
  notes         String?
  date          DateTime          @db.Date
  createdAt     DateTime          @default(now())

  product     Product @relation(fields: [productId], references: [id])
  performedBy User    @relation(fields: [performedById], references: [id])

  @@map("stock_movements")
}

// ─────────────────────────────────────────
// SALES
// ─────────────────────────────────────────

enum PaymentMethod {
  cash
  card
  transfer
  check
  mixed
}

enum SaleStatus {
  pending
  completed
  cancelled
  refunded
}

model Sale {
  id                  String        @id @default(uuid())
  saleNumber          String        @unique   // "VTA-2024-001"
  patientId           String
  soldById            String
  medicalRecordId     String?
  date                DateTime      @db.Date
  subtotal            Decimal       @db.Decimal(10, 2)
  discount            Decimal       @default(0) @db.Decimal(10, 2)
  tax                 Decimal       @db.Decimal(10, 2)  // 16% IVA
  total               Decimal       @db.Decimal(10, 2)
  paymentMethod       PaymentMethod
  prescriptionRequired Boolean      @default(false)
  status              SaleStatus    @default(pending)
  notes               String?
  warrantyExpiryDate  DateTime?     @db.Date
  warrantyTerms       String?
  completedAt         DateTime?
  cancelledAt         DateTime?
  refundedAt          DateTime?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  // Relaciones
  patient       Patient        @relation(fields: [patientId], references: [id])
  soldBy        User           @relation(fields: [soldById], references: [id])
  medicalRecord MedicalRecord? @relation(fields: [medicalRecordId], references: [id])
  items         SaleItem[]
  payments      Payment[]

  @@map("sales")
}

model SaleItem {
  id          String  @id @default(uuid())
  saleId      String
  productId   String
  productName String  // snapshot del nombre al momento de la venta
  productSku  String  // snapshot del SKU
  quantity    Int
  unitPrice   Decimal @db.Decimal(10, 2)
  discount    Decimal @default(0) @db.Decimal(5, 2)  // porcentaje
  subtotal    Decimal @db.Decimal(10, 2)
  total       Decimal @db.Decimal(10, 2)

  sale    Sale    @relation(fields: [saleId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("sale_items")
}

model Payment {
  id        String        @id @default(uuid())
  saleId    String
  method    PaymentMethod
  amount    Decimal       @db.Decimal(10, 2)
  reference String?       // número de transferencia, último 4 dígitos de tarjeta, etc.
  createdAt DateTime      @default(now())

  sale Sale @relation(fields: [saleId], references: [id], onDelete: Cascade)

  @@map("payments")
}

// ─────────────────────────────────────────
// CLINIC SETTINGS
// ─────────────────────────────────────────

model ClinicSettings {
  id          String  @id @default(uuid())
  name        String
  rfc         String?
  address     String?
  city        String?
  state       String?
  zipCode     String?
  phone       String?
  email       String?
  website     String?
  logo        String?
  taxRate     Decimal @default(0.16) @db.Decimal(4, 2)  // IVA
  currency    String  @default("MXN")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("clinic_settings")
}
```

---

## Relaciones Clave

### Patient → lo que le pertenece

```
Patient
 ├── PatientInsurance        (1:1)  seguro médico
 ├── PatientEmergencyContact (1:1)  contacto de emergencia
 ├── Appointment[]           (1:N)  citas programadas
 ├── MedicalRecord[]         (1:N)  historial médico
 ├── ClinicalExam[]          (1:N)  exámenes clínicos
 └── Sale[]                  (1:N)  compras realizadas
```

### Sale → composición de una venta

```
Sale
 ├── SaleItem[]              (1:N)  productos vendidos
 │    └── Product            (N:1)  referencia al producto
 ├── Payment[]               (1:N)  pagos (útil para mixed payment)
 ├── Patient                 (N:1)
 ├── User (soldBy)           (N:1)
 └── MedicalRecord?          (N:1)  receta asociada (opcional)
```

### MedicalRecord ↔ ClinicalExam

```
MedicalRecord
 └── ClinicalExam?           (1:1)  el examen clínico detallado
                                    puede existir sin historial médico
```

---

## Índices recomendados

```prisma
// Agregar en los modelos correspondientes:

model Patient {
  @@index([identificationId])
  @@index([lastName, firstName])
  @@index([status])
}

model Appointment {
  @@index([patientId])
  @@index([practitionerId])
  @@index([date])
  @@index([status])
}

model Sale {
  @@index([patientId])
  @@index([date])
  @@index([status])
  @@index([saleNumber])
}

model Product {
  @@index([category])
  @@index([status])
  @@index([sku])
}

model MedicalRecord {
  @@index([patientId])
  @@index([date])
}

model StockMovement {
  @@index([productId])
  @@index([date])
}
```

---

## Migraciones Prisma (flujo de trabajo)

```bash
# 1. Inicializar Prisma en el backend
cd backend
npx prisma init

# 2. Configurar DATABASE_URL en .env
DATABASE_URL="postgresql://user:password@localhost:5432/vision_kit_db"

# 3. Crear primera migración
npx prisma migrate dev --name init

# 4. Generar Prisma Client
npx prisma generate

# 5. Ver base de datos en Prisma Studio
npx prisma studio

# 6. Para nuevas migraciones tras cambios al schema
npx prisma migrate dev --name <nombre-descriptivo>
```

---

## Datos de Seed (usuarios mock actuales)

```typescript
// prisma/seed.ts

const users = [
  {
    email: 'admin@visionkit.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'Admin Principal',
    role: 'admin',
  },
  {
    email: 'gerente@visionkit.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'Gerente Principal',
    role: 'manager',
  },
  {
    email: 'optico1@visionkit.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'María García',
    role: 'optician',
  },
  {
    email: 'optico2@visionkit.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'Carlos Rodríguez',
    role: 'optician',
  },
];
```

---

## Módulos NestJS ↔ Tablas

| Módulo NestJS | Tablas principales |
|---------------|-------------------|
| `AuthModule` | `users` |
| `UsersModule` | `users` |
| `PatientsModule` | `patients`, `patient_insurances`, `patient_emergency_contacts` |
| `AppointmentsModule` | `appointments` |
| `MedicalRecordsModule` | `medical_records` |
| `ClinicalExamsModule` | `clinical_exams` |
| `InventoryModule` | `products`, `product_specifications`, `product_suppliers`, `stock_movements` |
| `SalesModule` | `sales`, `sale_items`, `payments` |
| `SettingsModule` | `clinic_settings` |

---

## Variables de entorno del backend

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/vision_kit_db"
JWT_SECRET="tu-clave-secreta-aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```
