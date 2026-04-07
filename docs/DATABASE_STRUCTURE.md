# Vision Kit — Database Structure

> **Propósito:** Documentación del schema Prisma, modelos, relaciones, enums y mapeos de tablas.
> Complementa el schema con contexto de negocio, ERD conceptual e historial de migraciones.
>
> **Etapa de lectura:** Consultar al trabajar con queries Prisma, crear migraciones, diseñar
> nuevos modelos o entender relaciones entre entidades de la base de datos.
>
> **MANTENIMIENTO:** Actualizar este archivo cada vez que se modifique `apps/backend/prisma/schema.prisma`.
> El schema en `prisma/schema.prisma` es la fuente de verdad — este doc debe reflejarlo siempre.

---

## Arquitectura de base de datos

- **Motor:** PostgreSQL vía **Supabase** (project: `fobfltxxsudplapdwlfj`)
- **ORM:** Prisma 5 (backend NestJS)
- **Migraciones:** Supabase CLI → `supabase/migrations/`
- **RLS:** habilitado en todas las tablas (para acceso directo desde frontend)
- **Auth de API:** NestJS gestiona su propio auth JWT con `passwordHash` en la tabla `profiles`

### Dos capas de acceso

| Capa | Quién | Cómo |
|------|-------|------|
| API REST | NestJS backend | Prisma ORM con `DATABASE_URL` pooling |
| Migraciones | Supabase CLI | `DIRECT_URL` conexión directa |
| Frontend (futuro) | React + Supabase JS | Supabase Auth + RLS policies |

---

## Diagrama de Entidades (ERD)

```
profiles (User) ──────────────────────────────────────────────┐
 │                                                              │
 ├─< appointments (practitioner)                                │
 ├─< sales (soldBy)                                             │
 ├─< medical_records (practitioner)                             │
 ├─< clinical_exams (examiner)                                  │
 └─< stock_movements (performedBy)                              │
                                                                │
patients ───────────────────────────────────────────────────┐  │
 ├─< appointments                                            │  │
 ├─< medical_records                                         │  │
 ├─< clinical_exams                                          │  │
 ├─< sales                                                   │  │
 ├── patient_insurances (1:1)                                │  │
 └── patient_emergency_contacts (1:1)                        │  │
                                                             │  │
sales ───────────────────────────────────────────────────┐  │  │
 ├─< sale_items >── products                             │  │  │
 ├─< payments                                            │  │  │
 └── medical_records? (opcional)                         │  │  │
                                                         │  │  │
products ────────────────────────────────────────────┐  │  │  │
 ├─< stock_movements                                 │  │  │  │
 ├── product_specifications (1:1)                    │  │  │  │
 └── product_suppliers (1:1)                         │  │  │  │
                                                    │  │  │  │
medical_records ── clinical_exams (1:1 opcional)     │  │  │  │
```

---

## Mapeo Tabla DB ↔ Modelo Prisma ↔ Campo clave

| Tabla DB | Modelo Prisma | Nota |
|----------|---------------|------|
| `profiles` | `User` | `@@map("profiles")` — auth NestJS con `password_hash` |
| `patients` | `Patient` | |
| `patient_insurances` | `PatientInsurance` | |
| `patient_emergency_contacts` | `PatientEmergencyContact` | |
| `appointments` | `Appointment` | Enums con `@map` (hyphens en DB) |
| `medical_records` | `MedicalRecord` | Columnas planas (sin JSONB) |
| `clinical_exams` | `ClinicalExam` | Columnas planas (sin JSONB) |
| `products` | `Product` | `ProductStatus` usa underscore en DB |
| `product_specifications` | `ProductSpecification` | |
| `product_suppliers` | `ProductSupplier` | |
| `stock_movements` | `StockMovement` | |
| `sales` | `Sale` | |
| `sale_items` | `SaleItem` | |
| `payments` | `Payment` | |
| `clinic_settings` | `ClinicSettings` | Singleton |

---

## Enums y mapeos importantes

```prisma
// Enums con hyphens en DB → underscores en Prisma via @map

enum AppointmentType {
  eye_exam             @map("eye-exam")
  contact_lens_fitting @map("contact-lens-fitting")
  frame_selection      @map("frame-selection")
  followup
  emergency
  adjustment
}

enum AppointmentStatus {
  in_progress @map("in-progress")
  no_show     @map("no-show")
  scheduled
  confirmed
  completed
  cancelled
}

enum ExamType {
  contact_lens @map("contact-lens")
  routine
  emergency
  followup
}

enum ProductCategory {
  contact_lenses @map("contact-lenses")
  frames
  lenses
  sunglasses
  accessories
  solutions
}

// ProductStatus usa valores propios (DB tiene: active, inactive, in_stock, low_stock, out_of_stock, discontinued)
enum ProductStatus {
  in_stock
  low_stock
  out_of_stock
  discontinued
}
```

---

## Variables de entorno del backend

```env
# apps/backend/.env

# Supabase — pooling para runtime (Prisma queries)
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase — directo para migraciones Prisma
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

JWT_SECRET="..."
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

---

## Migraciones (flujo de trabajo)

```bash
# Desde la raíz del monorepo — Supabase CLI
npx supabase migration new <nombre>   # crear archivo SQL vacío
npx supabase db push                  # aplicar al remoto

# Desde apps/backend — Prisma (solo para regenerar client)
npx prisma generate                   # regenerar client tras cambios al schema
npx prisma studio                     # GUI para explorar datos
```

> **IMPORTANTE:** Las migraciones las gestiona Supabase CLI (SQL puro), NO `prisma migrate`.
> Prisma solo se usa como ORM — el schema debe reflejar las tablas que existen en Supabase.

---

## Módulos NestJS ↔ Tablas

| Módulo NestJS | Tablas principales |
|---------------|-------------------|
| `AuthModule` | `profiles` |
| `UsersModule` | `profiles` |
| `PatientsModule` | `patients`, `patient_insurances`, `patient_emergency_contacts` |
| `AppointmentsModule` | `appointments` |
| `MedicalRecordsModule` | `medical_records` |
| `ClinicalExamsModule` | `clinical_exams` |
| `InventoryModule` | `products`, `product_specifications`, `product_suppliers`, `stock_movements` |
| `SalesModule` | `sales`, `sale_items`, `payments` |
| `SettingsModule` | `clinic_settings` |

---

## Datos de Seed

```typescript
// apps/backend/prisma/seed.ts
// Contraseña de todos: "123456" (bcrypt hash en passwordHash)

const users = [
  { email: 'admin@visionkit.com',   name: 'Admin Principal',    role: 'admin' },
  { email: 'gerente@visionkit.com', name: 'Gerente Principal',  role: 'manager' },
  { email: 'optico1@visionkit.com', name: 'María García',       role: 'optician' },
  { email: 'optico2@visionkit.com', name: 'Carlos Rodríguez',   role: 'optician' },
]
```
