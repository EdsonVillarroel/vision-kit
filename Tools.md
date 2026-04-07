# Vision Kit — Tools.md

> **Propósito:** Kanban de tareas del proyecto. Registra lo completado por sesión y
> las tareas pendientes o en progreso. Sirve como bitácora de avance del desarrollo.
>
> **Etapa de lectura:** Consultar al iniciar una sesión para retomar contexto de trabajo
> previo, o al planificar nuevas tareas para evitar duplicar esfuerzo.

---

## Stack de herramientas activas

### Backend API
| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| NestJS | 10 | Framework REST API |
| Prisma | 5 | ORM → PostgreSQL |
| `@nestjs/swagger` | latest | Documentación OpenAPI/Swagger |
| `@nestjs/passport` + `passport-jwt` | 10/4 | Autenticación JWT |
| `bcrypt` | 5 | Hashing de contraseñas |
| `class-validator` + `class-transformer` | 0.14/0.5 | Validación de DTOs |

### Base de datos
| Herramienta | Propósito |
|-------------|-----------|
| Supabase | PostgreSQL hosting + RLS + Storage |
| Supabase CLI | Gestión de migraciones SQL |
| Prisma Client | ORM para queries en NestJS |

### Frontend
| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| React | 19 | UI |
| Vite | 7 | Dev server + build |
| React Router DOM | 7 | Routing |
| TailwindCSS | 4 | Estilos |
| `@supabase/supabase-js` | latest | Cliente Supabase (instalado, pendiente integración Storage) |

---

## Lo que YA está funcionando ✅

### Backend + Base de datos
- **7 migraciones aplicadas** en Supabase (incluyendo `007_fix_enum_types`)
- **4 usuarios seed** activos (admin, gerente, optico1, optico2 — contraseña: 123456)
- **Clinic settings** creado con UUID fijo
- **Enums Prisma alineados** con la DB via `@@map` directives

### Endpoints API (40 total)
```
POST   /api/v1/auth/login          ← público
GET    /api/v1/auth/me             ← JWT requerido

GET    /api/v1/users               ← admin, manager
POST   /api/v1/users               ← admin
PATCH  /api/v1/users/:id           ← admin
DELETE /api/v1/users/:id           ← admin

GET    /api/v1/patients            ← autenticados (?search=)
POST   /api/v1/patients
PATCH  /api/v1/patients/:id
DELETE /api/v1/patients/:id        ← admin, manager
GET    /api/v1/patients/:id/medical-records
GET    /api/v1/patients/:id/sales

GET    /api/v1/appointments        ← (?date=&status=&practitionerId=)
GET    /api/v1/appointments/slots  ← (?date=&practitionerId=)
POST   /api/v1/appointments
PATCH  /api/v1/appointments/:id
DELETE /api/v1/appointments/:id    ← admin, manager

GET    /api/v1/medical-records     ← (?patientId=)
POST   /api/v1/medical-records
PATCH  /api/v1/medical-records/:id
DELETE /api/v1/medical-records/:id ← admin, manager

GET    /api/v1/clinical-exams      ← (?patientId=)
POST   /api/v1/clinical-exams
PATCH  /api/v1/clinical-exams/:id
DELETE /api/v1/clinical-exams/:id  ← admin, manager

GET    /api/v1/inventory           ← (?category=&status=&search=)
GET    /api/v1/inventory/alerts    ← stock bajo/agotado
GET    /api/v1/inventory/:id/movements
POST   /api/v1/inventory           ← admin, manager
PATCH  /api/v1/inventory/:id       ← admin, manager
POST   /api/v1/inventory/:id/adjust ← admin, manager
DELETE /api/v1/inventory/:id       ← admin, manager

GET    /api/v1/sales               ← (?status=&patientId=&from=&to=)
GET    /api/v1/sales/summary       ← admin, manager (?from=&to=)
POST   /api/v1/sales
PATCH  /api/v1/sales/:id/status

GET    /api/v1/settings
PATCH  /api/v1/settings            ← admin
```

### Swagger UI
- **URL:** `http://localhost:3000/api/docs`
- Bearer auth persistente entre recargas
- Todos los endpoints documentados con `@ApiOperation`, `@ApiQuery`, `@ApiResponse`
- DTOs con ejemplos en `@ApiProperty`

### Frontend conectado al backend
- `apps/frontend/src/lib/api.ts` — cliente HTTP con JWT Bearer automático
- `apps/frontend/.env.local` — `VITE_API_URL=http://localhost:3000/api/v1`
- Todos los servicios usan la API real (sin mocks):
  - `authService` → `/auth/login`, `/auth/me`
  - `patientService` → `/patients`
  - `inventoryService` → `/inventory`
  - `salesService` → `/sales`
  - `appointmentService` → `/appointments`
  - `medicalRecordService` → `/medical-records`
  - `clinicalExamService` → `/clinical-exams`
  - `userService` → `/users`

### Base de datos Supabase
- **Proyecto:** `fobfltxxsudplapdwlfj` (us-west-2)
- **7 migraciones aplicadas** — schema completo y alineado con Prisma
- **RLS** habilitado en todas las tablas
- **Storage:** buckets `avatars` (privado) y `product-images` (público)

---

## Problemas conocidos y fixes aplicados

| Problema | Fix aplicado |
|----------|-------------|
| Enums Prisma en PascalCase vs DB snake_case | `@@map` en todos los enums del schema |
| `profiles.status` era text, no enum | Migración 007: crea `user_status` enum, altera columna |
| `avatar` → `avatarUrl` en users.service / auth.service / DTOs | Renombrado a `avatarUrl` |
| `authModule.ts` exportaba `JwtAuthGuard` sin importarlo | Importado y añadido a providers |
| Hook `useAppointments` pasaba 2 args a `create` | Eliminado argumento `createdBy` extra |
| `userService.toggleStatus` requiere `currentStatus` | UsersPage lee el status actual antes de llamar |
| `package.json` raíz con conflicto de merge | Resuelta a favor de versión monorepo |
| `appointments.patient_name` era NOT NULL → seed fallaba | Migración 008: `drop not null` en esa columna |
| `seed.ts` usaba `findFirst`/`upsert` en citas con PgBouncer | Reescrito con `$executeRawUnsafe` + `ON CONFLICT DO NOTHING` |
| `getSummary()` solo retornaba totales básicos | Expandido: `topProducts`, `salesByMethod`, `salesByDay` |
| Dashboard tenía datos mock hardcoded | Reemplazado por llamadas reales a `/patients`, `/appointments`, `/inventory/alerts`, `/sales/summary` |
| `address/city/state/zipCode` en tipo Patient eran required | Marcados opcionales para alinearse con el schema Prisma |
| `cancellationReason` no existía en Sale | Migración 009 + campo en Prisma schema + `updateStatus()` lo usa |
| `InventoryPage` / `SalesPage` / `ClinicPage` / `ProfilePage` con datos mock | Conectadas a API real (sesión 4) |
| `sales.service.ts create()` no descontaba stock | Añadido: descuenta stock + crea `StockMovement` de tipo `out` |
| `visitCount` y `totalSpent` del paciente no se actualizaban | Añadido: `increment` con Prisma al crear venta |
| `AuthContext` no exponía forma de actualizar usuario localmente | `updateUser()` añadido al contexto |

---

## Auditoría de pantallas — Estado de integración con API

> Auditoría completa realizada el 2026-03-29 sobre los 31 componentes de página.

### ✅ Páginas correctamente conectadas a la API (31/31) — COMPLETADO

| Módulo | Páginas OK |
|--------|-----------|
| Appointments | AppointmentsPage |
| Clinical Exams | ClinicalExamsListPage, NewClinicalExamPage, EditClinicalExamPage, ClinicalExamDetailsPage |
| Inventory | InventoryListPage, NewProductPage, EditProductPage, ViewProductPage, AdjustStockPage, AlertsPage, StockControlPage, FramesPage, LensesPage |
| Medical Records | MedicalRecordsPage, NewMedicalRecordPage, EditMedicalRecordPage, ViewMedicalRecordPage |
| Patients | PatientsPage, NewPatientPage, EditPatientPage, ViewPatientPage |
| Sales | SalesListPage, NewSalePage, ViewSalePage |
| Settings | UsersPage, UserFormPage, AppearancePage |
| Dashboard | DashboardPage (conectado en sesión 3) |

---

## Lo que se puede hacer a continuación

### Completado en sesión 4 ✅
- [x] `InventoryPage` → conectada a `useInventory()`, stats calculadas del array real
- [x] `SalesPage` → conectada a `useSales()` + `useSalesSummary()`, filtros funcionales
- [x] `ClinicPage` → carga desde `GET /settings`, guarda con `PATCH /settings`
- [x] `ProfilePage` → guarda con `userService.update()`, actualiza contexto auth + localStorage
- [x] **Stock auto-descuento** → `sales.service.ts create()` descuenta stock y crea `StockMovement`
- [x] **`visitCount` y `totalSpent`** → se actualizan con `increment` de Prisma al crear venta

### Completado en sesión 5 ✅
- [x] **`SalesPage` filtro de fecha** → `useSales(dateFrom, dateTo)` pasa params al backend; filtro local eliminado
- [x] **Revertir stock al cancelar/reembolsar** → `updateStatus()` revierte stock + crea `StockMovement 'in'` + decrementa `visitCount`/`totalSpent` del paciente (solo si venía de pending/completed)
- [x] **Horarios de atención en `ClinicPage`** → campo `business_hours JSONB` migración 010 + Prisma schema + DTO + UI editable con time inputs por día
- [x] **Cambio de contraseña** → `PATCH /users/:id/password` (solo propio usuario o admin) + formulario en `ProfilePage`
- [x] **Code splitting** → `React.lazy()` + `Suspense` en `routes/index.tsx` — todos los ~35 componentes de página son lazy
- [x] **Error boundary global** → `ErrorBoundary` class component wrapeando toda la app en `App.tsx`

### Endpoints actualizados
- **Total endpoints: 43** → añadidos `PATCH /users/:id/password`, `POST /upload/avatar/:userId`, `POST /upload/product-image/:productId`

### Completado en sesión 6 ✅
- [x] **Upload de imágenes** → Storage via NestJS (service_role key) — avatars firmados 1 año, product-images públicos

### Completado en sesión 7 ✅
- [x] **Loading states (skeletons)** → `Skeleton.tsx` con 7 variantes exportadas desde `ui/index.ts`; 20 páginas actualizadas — shimmer en stat cards, tablas, paneles, detail cards y forms

### Completado en sesión 8 ✅
- [x] **Módulo `public` en backend** → 4 endpoints sin auth (`GET /public/catalog`, `GET /public/catalog/:id`, `GET /public/clinic`, `POST /public/bookings`) + Swagger tag `public`
- [x] **Seguridad anti-DDoS** → `@nestjs/throttler` (10/seg, 100/min, 1000/h global) + `helmet` + CORS multi-origen via `CORS_ORIGINS`; `POST /public/bookings` con throttle propio (2/10s, 3/min)
- [x] **Modelo `PublicBooking`** → migración 011 aplicada en Supabase + Prisma regenerado
- [x] **`apps/landing` en monorepo** → React + Vite + TS + Tailwind v4; 4 páginas: `HomePage`, `CatalogPage`, `ProductPage`, `BookingPage`; scripts `npm run landing` / `npm run dev:all`; build OK (642ms)

### Endpoints actualizados
- **Total endpoints: 47** → añadidos `GET /public/catalog`, `GET /public/catalog/:id`, `GET /public/clinic`, `POST /public/bookings`

### Prioridad MEDIA — Funcionalidades pendientes
- [ ] **Notificaciones** → recordatorios de citas (email/SMS via servicio externo)
- [ ] **Exportar reportes** → PDF de ventas, historial clínico

### Completado en sesión 9 ✅
- [x] **`ConfirmModal` reutilizable** → `components/ui/ConfirmModal.tsx` con variantes danger/warning/default; exportado desde `ui/index.ts`
- [x] **Variantes `danger` y `warning` en `Button`** → añadidas al type union y al mapa de estilos
- [x] **`window.confirm` / `window.alert` eliminados** → `UsersPage` usa `ConfirmModal` + `useSnackbar`; `SaleDetails` usa `useSnackbar` + error inline; `SaleForm.addPayment` usa `setError` inline
- [x] **`SkeletonPageWithStats` en `UsersPage`** → corregido `statCount={0}` → `statCount={4}` para que coincida con las 4 stat cards reales
- [x] **Empty states pulidos** → `FramesPage` y `LensesPage` con card+icono+mensaje contextual+CTA "Agregar producto"

### Completado en sesión 10 ✅
- [x] **Consistencia de temas en spinners** → todos los `border-blue-600` en spinners reemplazados por `border-theme-primary border-t-transparent` (7 archivos: `App.tsx`, `AppointmentsList`, `AppointmentCalendarView`, `InventoryList`, `MedicalRecordsList`, `PatientSearch`, `routes/index.tsx`)
- [x] **`ConfirmModal` en `ClinicalExamsList` y `PatientsList`** → reemplazado patrón inline (Confirmar/Cancelar en fila) por `ConfirmModal` con variante `danger`, estado `isDeleting` y backdrop click para cerrar

### Completado en sesión 11 ✅
- [x] **`PageLoader` mejorado** → reemplazado spinner inline por `SkeletonPageWithStats` (statCount=4, tableRows=8) en `routes/index.tsx` — reduce CLS en navegación inicial
- [x] **Refresh token automático** → `POST /auth/refresh` en backend (re-firma nuevo JWT con el token actual válido) + interceptor en `api.ts` que reintenta petición tras 401 (serializado para múltiples peticiones concurrentes) + renovación proactiva en `useAuth.tsx` si el token expira en menos de 1 día

### Endpoints actualizados
- **Total endpoints: 48** → añadido `POST /auth/refresh`

### Prioridad MEDIA — Mejoras técnicas pendientes

### Prioridad BAJA — Nice to have
- [ ] Tests E2E del backend
- [ ] CI/CD con GitHub Actions
- [ ] Deploy del backend (Railway, Render, o Supabase Edge Functions)
- [ ] Multi-clínica (agregar `clinic_id` a todas las tablas)

---

## Comandos de uso frecuente

```bash
# Desarrollo
npm run dev                    # frontend (5173) + backend (3000) en paralelo
npm run dev:all                # frontend + backend + landing (5174) en paralelo
npm run backend                # solo NestJS
npm run frontend               # solo Vite (panel interno)
npm run landing                # solo landing (portal público)

# Base de datos
npm run db:seed                # insertar usuarios iniciales
npm run db:studio              # GUI Prisma Studio
npx supabase migration new <nombre>   # nueva migración
PGPASSWORD="V1ll@rr0elSupa" psql "postgresql://postgres.fobfltxxsudplapdwlfj@aws-0-us-west-2.pooler.supabase.com:5432/postgres" -f <archivo.sql>   # aplicar migración directa

# Backend
cd apps/backend && ./node_modules/.bin/prisma generate   # regenerar Prisma Client (usar local, no npx)
nest build                     # compilar NestJS
```
