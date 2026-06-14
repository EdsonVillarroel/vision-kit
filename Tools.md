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

### Multi-Tenant SaaS — Sesión 1 ✅
- [x] **Migración 012: Multi-Tenant Foundation** → tablas `tenants`, `subscription_plans`, `subscriptions`, `platform_admins`; `tenant_id` nullable en 12 tablas de negocio; enum `super_admin` en `user_role`
- [x] **Prisma schema actualizado** → nuevos modelos `Tenant`, `SubscriptionPlan`, `Subscription`, `PlatformAdmin`; `tenantId` (nullable) en todos los modelos de negocio

### Multi-Tenant SaaS — Sesión 2 ✅
- [x] **Migración 013: Backfill + NOT NULL** → tenant default "Visión 20/20 HD" (`00000000-0000-4000-a000-000000000001`); 3 planes (Básico Bs 150, Profesional Bs 350, Empresarial Bs 700); suscripción Profesional para tenant default; platform admin (`platform@visionkit.com`)
- [x] **Backfill `tenant_id`** → todas las filas existentes asignadas al tenant default
- [x] **`tenant_id` NOT NULL** → en 12 tablas de negocio
- [x] **Unique constraints tenant-scoped** → `patients(tenant_id, identification_id)`, `products(tenant_id, sku)`, `appointments(tenant_id, appointment_number)`, `clinical_exams(tenant_id, exam_number)`, `sales(tenant_id, sale_number)`, `clinic_settings(tenant_id)`
- [x] **DB defaults** → `tenant_id` con DEFAULT al tenant default (compatibilidad temporal hasta CLS middleware en sesión 3)
- [x] **Prisma schema** → `tenantId` required + `@default(dbgenerated())` + `@@unique` compuestos
- [x] **Seed actualizado** → `findUnique` con composite keys `tenantId_identificationId` y `tenantId_sku`
- [x] **Build OK** → backend compila sin errores

### Multi-Tenant SaaS — Sesión 3 ✅
- [x] **`nestjs-cls` instalado** → dependencia nueva en `apps/backend`
- [x] **`ClsModule` global** → `ClsModule.forRoot({ global: true, middleware: { mount: false } })` en `AppModule`
- [x] **`apps/backend/src/tenant/` creado** → 6 archivos de infraestructura tenant
- [x] **`tenant.constants.ts`** → `TENANT_ID_KEY` + `TENANT_SCOPED_MODELS` (16 modelos Prisma)
- [x] **`tenant.decorator.ts`** → `@CurrentTenant()` param decorator — lee `request.tenantId`
- [x] **`tenant-cls.middleware.ts`** → extrae tenantId del JWT (fallback: query DB por `user.tenantId`) → guarda en CLS + `req.tenantId`; soporta JWT con y sin `tenantId` en payload (Sesión 4+)
- [x] **`tenant.guard.ts`** → `TenantGuard` verifica que el contexto tenga tenantId; también bloquea acceso cross-tenant via `params.tenantId`
- [x] **`tenant-prisma.service.ts`** → `TenantPrismaService` con `$extends` Prisma; auto-inyecta `tenantId` en findMany/findFirst/count/create/createMany/update/updateMany/delete/deleteMany/upsert; `findUnique` excluido (ver nota en el archivo)
- [x] **`tenant.module.ts`** → `@Global()` — exporta `TenantPrismaService`, `TenantGuard`, `TenantClsMiddleware`
- [x] **`AppModule`** → implementa `NestModule`; registra `TenantModule`; aplica `TenantClsMiddleware` a todas las rutas
- [x] **Build OK** → TypeScript sin errores, `nest build` limpio

### Multi-Tenant SaaS — Sesión 4 ✅
- [x] **JWT payload ampliado** → `auth.service.ts login()` y `refresh()` incluyen `tenantId` y `role` en el payload
- [x] **`auth/jwt.strategy.ts` actualizado** → `validate()` incluye `tenantId` en el select y lo retorna en el user object
- [x] **`auth/auth.controller.ts` actualizado** → `refresh()` pasa `req.user.tenantId` y `req.user.role` al service
- [x] **`platform-auth/` módulo creado** → 6 archivos: `dto/platform-login.dto.ts`, `platform-jwt.strategy.ts` (strategy `'jwt-platform'`), `platform-auth.guard.ts`, `platform-auth.service.ts`, `platform-auth.controller.ts`, `platform-auth.module.ts`
- [x] **`PlatformAuthModule` registrado** → en `AppModule` después de `AuthModule`
- [x] **Rutas platform-auth** → `POST /platform/auth/login`, `GET /platform/auth/me`, `POST /platform/auth/refresh` — totalmente separadas de tenant auth
- [x] **Build OK** → `nest build` sin errores

### Multi-Tenant SaaS — Sesión 5 ✅
- [x] **`platform/` módulo creado** → `platform.module.ts`, `platform.service.ts`, `platform.controller.ts` + 5 DTOs
- [x] **Provisioning de tenants** → `POST /platform/tenants` en transacción Prisma: crea tenant + suscripción + usuario `super_admin` (password hasheado con bcrypt)
- [x] **CRUD tenants** → `GET/PATCH /platform/tenants`, `GET /platform/tenants/:id`, `PATCH /platform/tenants/:id/suspend|activate`
- [x] **CRUD planes** → `GET/POST /platform/plans`, `PATCH /platform/plans/:id`
- [x] **Gestión suscripciones** → `GET /platform/subscriptions`, `PATCH /platform/subscriptions/:id` (cambio de plan, estado, fechas, notas de pago QR)
- [x] **Stats globales** → `GET /platform/stats` — totales de tenants por estado, MRR calculado de suscripciones activas, usuarios, pacientes, nuevos este mes
- [x] **`PlatformModule` registrado** → en `AppModule` después de `PlatformAuthModule`
- [x] **Build OK** → `nest build` sin errores
- [x] **Total endpoints: 58** → +12 platform-management

### Multi-Tenant SaaS — Sesión 6 ✅
- [x] **Migración services a `TenantPrismaService`** → 8 services de negocio migrados: `users`, `patients`, `appointments`, `medical-records`, `clinical-exams`, `inventory`, `sales`, `settings`
- [x] **`findUnique` → `findFirst`** → en todos los services migrados (TenantPrismaService no inyecta tenantId en findUnique)
- [x] **Bloqueo `super_admin` en create()** → `users.service.ts` lanza `ForbiddenException` si se intenta crear usuario con rol `super_admin`
- [x] **`super_admin` en `@Roles()`** → `users.controller.ts` permite `super_admin` en todas las rutas admin+; `changePassword` también acepta `super_admin`
- [x] **`public.controller.ts` con `:tenantSlug`** → rutas cambiadas a `GET/POST /public/:tenantSlug/{catalog|clinic|bookings}`
- [x] **`public.service.ts` con tenant lookup** → cada método busca tenant por slug, verifica `status === 'active'`, aplica `tenantId` en todas las queries; usa `PrismaService` directo (sin CLS — no hay JWT en rutas públicas)
- [x] **Build OK** → `npm run build:backend` sin errores TypeScript

### Endpoints actualizados
- **Total endpoints: 62** → rutas public ahora incluyen `:tenantSlug` (43 tenant + 4 public + 3 platform-auth + 12 platform-management)

### Multi-Tenant SaaS — Sesión 7 ✅
- [x] **`apps/admin/` creada** → nueva app React 19 + Vite 7 + TailwindCSS v4 + React Router DOM v7 + clsx para platform admins
- [x] **Autenticación platform** → `usePlatformAuth` hook + `platformAuthService` con `platform_token` en localStorage; refresh automático al iniciar + interceptor 401 en `api.ts`
- [x] **Feature-based modular** → 5 features: `platform-auth`, `layout`, `tenants`, `plans`, `subscriptions` + `dashboard`; misma arquitectura que `apps/frontend`
- [x] **Design system replicado** → Button, Card, Input, Badge, StatCard, Table, Skeleton, ConfirmModal, Snackbar, ErrorBoundary — idénticos al frontend
- [x] **Tema indigo** → CSS variables indigo/violet fijas (sin selector de tema); diferencia visualmente el panel admin del panel de óptica
- [x] **Sidebar con branding "VK Platform Admin"** → misma lógica collapse/mobile que el frontend
- [x] **7 páginas implementadas** → `DashboardPage` (stats globales), `TenantsPage` (tabla + filtros + suspend/activate), `NewTenantPage` (wizard 3 pasos), `ViewTenantPage` (detalle + acciones), `EditTenantPage` (form edición), `PlansPage` (CRUD planes), `SubscriptionsPage` (tabla + edit modal)
- [x] **Code splitting** → `React.lazy` + `Suspense` en `routes/index.tsx`
- [x] **Monorepo** → workspace `apps/admin` + script `npm run admin` (puerto 5175) + `build:admin` en root `package.json`
- [x] **Build OK** → TypeScript limpio + Vite build 952ms (87 módulos)

### Multi-Tenant SaaS — Sesión 8 ✅
- [x] **`super_admin` en frontend** → `UserRole` incluye `'super_admin'`; `User` tiene `tenantId`; `ROLE_PERMISSIONS.super_admin` con acceso total
- [x] **`UsersPage`** → mapas de rol/color actualizados para incluir `super_admin` (badge púrpura)
- [x] **`ThemeContext` con brand overrides** → `setBrandColors()` en contexto; `adjustHex()` helper; brand colors persisten en `localStorage('brand-colors')` y sobrescriben el tema
- [x] **`ClinicSettingsContext`** → nuevo contexto en `features/settings/context/`; fetch settings post-auth; llama `setBrandColors()` con `primaryColor`/`accentColor` del tenant; limpia colores en logout
- [x] **`App.tsx`** → `ClinicSettingsProvider` wraps `AppContent` dentro de `AuthProvider`
- [x] **`Sidebar`** → muestra nombre de clínica dinámico + logo (con fallback a inicial); usa `useClinicSettings()`
- [x] **`AppearancePage`** → sección "Colores de Marca" con `<input type="color">` para admin/super_admin; preview en tiempo real; botón guardar → `settingsService.update()`; botón restablecer
- [x] **Backend** → `primaryColor`/`accentColor` en `ClinicSettings` Prisma model + `UpdateSettingsDto`; migración `014_clinic_settings_colors.sql`
- [x] **Build** → TypeScript limpio en todos los archivos nuevos (errores pre-existentes en inventory/ProfilePage no son de esta sesión)

### Multi-Tenant SaaS — Sesión 9 ✅
- [x] **Routing `/:tenantSlug/*`** → `App.tsx` usa `<Route path="/:tenantSlug" element={<TenantLayout />}>` con child routes; redirect de `*` → `/vision-2020-hd`
- [x] **`TenantContext`** → nuevo `apps/landing/src/context/TenantContext.tsx`; `TenantLayout` usa `useParams` para leer el slug; fetch `getClinicInfo(tenantSlug)`; aplica `--brand` CSS var; expone `{ tenantSlug, clinicInfo, brandColor, isLoading, path() }`
- [x] **API client** → todos los métodos de `publicApi` reciben `tenantSlug` como primer argumento; URLs actualizadas a `/public/:tenantSlug/...`
- [x] **`HomePage`** → nombre, logo, color de marca dinámicos desde `useTenant()`; categorías con SVG usando `brandColor`; WA link desde `clinicInfo.phone`; dirección desde `clinicInfo.address`
- [x] **`CatalogPage`** → `publicApi.getCatalog(tenantSlug, {...})`
- [x] **`ProductPage`** → `publicApi.getProduct(tenantSlug, id)`; navegación con `path('catalogo')`; WA link dinámico
- [x] **`BookingPage`** → `publicApi.createBooking(tenantSlug, data)`; link "Volver" con `path()`; WA confirm con teléfono dinámico
- [x] **`Header`** → nav links dinámicos con `path()`; nombre y logo desde `clinicInfo`
- [x] **`Footer`** → nombre, dirección, teléfono y WA link desde `clinicInfo`
- [x] **`TopBar`** → logo desde `clinicInfo.logo`
- [x] **Backend** → `getClinicInfo` retorna `primaryColor` + `accentColor`; Prisma client regenerado
- [x] **TypeScript** → limpio con `skipLibCheck` (error vite.config.ts pre-existente de versiones en monorepo)

### Multi-Tenant SaaS — Sesión 10 ✅
- [x] **`SubscriptionGuard`** → `apps/backend/src/tenant/subscription.guard.ts`; verifica `tenant.status === 'active'` en cada request; cache in-memory 5 min por `tenantId`; rutas sin tenantId en CLS (public/platform) pasan sin verificación; devuelve HTTP 402 si suscripción inactiva
- [x] **Registro global** → `SubscriptionGuard` exportado desde `TenantModule`; registrado como `APP_GUARD` en `AppModule` (después de `ThrottlerGuard`)
- [x] **`ApiError` en frontend** → `apps/frontend/src/lib/api.ts` exporta clase `ApiError` con campo `status`; `setOn402Handler()` para registrar callback global
- [x] **`SuspendedView` en `App.tsx`** → `AppContent` registra handler 402 via `setOn402Handler`; `isSuspended` state activa `SuspendedView` con mensaje, CTA WhatsApp y botón logout; se resetea al hacer logout
- [x] **Migración 015: RLS** → `supabase/migrations/20260411060000_015_rls_tenant_isolation.sql`; habilita RLS en 16 tablas de negocio + 4 de plataforma; políticas `service_role_all` bypass para Prisma; protege acceso directo a DB
- [x] **TypeScript** → limpio en backend y frontend (0 errores)

### Próximas tareas — Prioridad ALTA

- [ ] **Deploy completo** → backend en Railway/Render + frontend/landing/admin en Vercel; variables de entorno prod, CORS origins, dominio personalizado por app
- [ ] **Notificaciones de reservas** → email vía Resend/SendGrid o WhatsApp Business API cuando llega una reserva nueva al portal público; disparar desde `public.service.ts createBooking()`

### Próximas tareas — Prioridad MEDIA

- [ ] **Tests de integración backend** → cubrir `TenantPrismaService`, `SubscriptionGuard` y rutas críticas (aislamiento multi-tenant, 402 en tenant suspendido)
- [ ] **Exportar reportes** → PDF de ventas e historial clínico (librería tipo `pdfmake` o `puppeteer`)
- [ ] **Onboarding flow** → wizard de configuración inicial para nuevos tenants (logo, colores, horarios, primer usuario)

### Prioridad BAJA — Nice to have

- [ ] CI/CD con GitHub Actions (build + tests en cada PR)

---

## Comisiones y Métricas de Ventas — Plan de ejecución

> **Contexto:** nueva feature para ópticas — comisión por venta configurable por óptico + reporte consultivo con export PDF + métricas/leaderboard de ventas.
>
> **Decisiones del fundador (fijadas 2026-04-17):**
> - `commissionRate` **por usuario** (Decimal 0-100, default 0).
> - Base de cálculo: **subtotal − discount** (sin IVA) sobre ventas `status=completed`.
> - Cierre **a demanda**: reporte consultivo con PDF. **Sin snapshot en DB**, sin tabla de periodos, sin flujo de pago.
> - Visibilidad MVP: **solo admin/super_admin**. Manager/optician ven 403.
> - Gate por plan: flag `commissions` en `SubscriptionPlan.features` — disponible en **Óptica Pro** y **Cadena**.
>
> **Nota de orden:** el seed de `features.commissions` se activa recién en Sesión 5 (junto al gating) para no confundir ambientes mientras el cálculo está en construcción.

### Sesión 1 — Fundación backend y modelo

**Objetivo:** agregar `commissionRate` al modelo User y exponer endpoints de configuración por usuario.
**Dependencias:** ninguna — `profiles` y auth ya en producción.
**Entregables:**
- [x] Migración SQL: `npx supabase migration new add_commission_rate_to_profiles` con `commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0` + check `>= 0 AND <= 100`.
- [x] `schema.prisma`: `commissionRate Decimal @default(0) @db.Decimal(5,2) @map("commission_rate")` en `User`.
- [x] Regenerar Prisma client + `db push` a Supabase.
- [x] Extender `UpdateUserDto` con `commissionRate?: number` + `@IsNumber() @Min(0) @Max(100)`.
- [x] Incluir `commissionRate` en el `select` de `users.service.ts` (nunca exponer `passwordHash`).
- [x] Swagger: `@ApiProperty({ example: 5.5, description: 'Porcentaje 0-100' })`.
- [x] **Bonus:** índice compuesto `sales(tenant_id, date, status)` si no existe — necesario para queries de Sesión 2.

**Archivos:** `supabase/migrations/*_add_commission_rate.sql`, `apps/backend/prisma/schema.prisma`, `apps/backend/src/users/dto/*`, `apps/backend/src/users/users.service.ts`.
**Criterio de aceptación:** `PATCH /users/:id` con `commissionRate: 5` persiste y `GET /users/:id` lo retorna.
**Estimación:** 1 día.

### Sesión 2 — Módulo commissions y endpoints de cálculo

**Objetivo:** calcular comisiones on-the-fly por rango de fechas sobre ventas `completed`.
**Dependencias:** Sesión 1.
**Entregables:**
- [x] `CommissionsModule` con controller + service usando `TenantPrismaService`.
- [x] `GET /commissions?from=&to=&userId?=` → agrupado por vendedor: `{ userId, name, commissionRate, salesCount, grossBase, commissionAmount }`. Base = `sum(subtotal - discount)` para `status='completed'` en rango.
- [x] `GET /commissions/leaderboard?from=&to=&limit=10` → top vendedores por monto vendido.
- [x] `GET /commissions/summary/:userId?from=&to=` → detalle por venta (saleNumber, fecha, base, comisión).
- [x] Guards: `JwtAuthGuard` + `RolesGuard` + `@Roles('admin', 'super_admin')`.
- [x] Swagger tag `commissions` con ejemplos.
- [x] Validar `from <= to` y default últimos 30 días si faltan.

**Archivos:** `apps/backend/src/commissions/{commissions.module,controller,service}.ts`, `dto/query-commissions.dto.ts`, `apps/backend/src/app.module.ts`, `docs/API_ENDPOINTS.md`.
**Criterio de aceptación:** los tres endpoints retornan números consistentes con query SQL manual. 403 para manager/optician.
**Estimación:** 1.5 días.

### Sesión 3 — UI Admin: comisiones con export PDF

**Objetivo:** página operativa con filtros, tabla por óptico y export PDF.
**Dependencias:** Sesión 2.
**Entregables:**
- [x] Feature `commissions` en frontend: `{services,hooks,components,types,index.ts}`.
- [x] `hooks/useCommissions` con `useCommissionsReport(from,to)` y `useCommissionsByUser(id,from,to)`.
- [x] Página `/commissions`: `DateRangePicker` + `Table` (óptico, ventas, base, %, comisión) + totales en footer.
- [x] Editar `UserFormPage` para incluir input `commissionRate` (number 0-100 con sufijo %).
- [x] Export PDF con **pdfmake** (mejor soporte unicode/español que jsPDF, tablas nativas). Dynamic import al click para no inflar bundle.
- [x] Botón "Exportar PDF" → header con logo + nombre del tenant + rango + timestamp + nota "Reporte consultivo basado en ventas completed al momento de emisión".
- [x] Ruta en `routes/index.tsx` con `React.lazy`; entrada de menú solo para admin.

**Archivos:** `apps/frontend/src/features/commissions/**`, `apps/frontend/src/pages/commissions/CommissionsPage.tsx`, `apps/frontend/src/pages/users/UserFormPage.tsx`, `apps/frontend/src/routes/index.tsx`, `package.json`.
**Criterio de aceptación:** admin filtra por mes, ve tabla correcta y descarga PDF legible con acentos bien renderizados.
**Estimación:** 2 días.

### Sesión 4 — Métricas de ventas con Recharts

**Objetivo:** dashboard visual de ventas para decisiones comerciales.
**Dependencias:** Sesión 2 (reutiliza leaderboard); no bloquea Sesión 3 — ambas pueden ir en paralelo.
**Entregables:**
- [x] Instalar **recharts** (composable, tree-shakeable, integra con React 19 y Tailwind v4).
- [x] Backend: `GET /sales/metrics?from=&to=` → `{ byDay[], byPaymentMethod[], topSellers[], byCategory[] }` vía Prisma `groupBy`.
- [x] Página `/metrics`: 4 `StatCard` (total, transacciones, ticket promedio, tasa refunds) + LineChart ventas/día + BarChart top 5 vendedores + PieChart mix por método de pago.
- [x] Filtros: rango fecha + presets (hoy/7d/30d/mes).
- [x] Skeletons mientras carga; empty state con mensaje contextual.

**Archivos:** `apps/backend/src/sales/sales.{controller,service}.ts`, `apps/frontend/src/features/metrics/**`, `apps/frontend/src/pages/metrics/MetricsPage.tsx`, `apps/frontend/src/routes/index.tsx`.
**Criterio de aceptación:** gráficos renderizan con seed; cambio de rango refetchea sin flicker.
**Estimación:** 2 días.

### Sesión 5 — Gating por plan, polish y QA

**Objetivo:** activar feature flag, endurecer UX y documentar.
**Dependencias:** Sesiones 1-4.
**Entregables:**
- [x] Actualizar `seedPlans.ts`: `commissions: true` en Óptica Pro y Cadena; `false` en Escaparate/Consultorio. Re-seed.
- [x] Backend: guard/check en `CommissionsController` y `GET /sales/metrics` que valide `plan.features.commissions === true`, responder 402 `{ error: 'FeatureNotInPlan', feature: 'commissions' }`.
- [x] Frontend: `hasFeature('commissions')` oculta menú + protege rutas con redirect a `/settings/plan` + banner de upgrade.
- [x] Interceptor `api.ts`: 402 → snackbar (FeatureNotInPlan) + modal upgrade existente (PlanQuotaExceeded) + suspended view (resto).
- [x] Skeletons en tablas y gráficos; `ConfirmModal` al cambiar `commissionRate` de usuario con ventas en el mes ("este cambio afecta reportes de periodos anteriores").
- [x] Smoke test manual documentado en el reporte de la sesión.
- [x] Actualizar `docs/API_ENDPOINTS.md`, `docs/PROJECT_STRUCTURE.md`, `CLAUDE.md` (features list + endpoint count).

**Archivos:** `apps/backend/prisma/seedPlans.ts`, `apps/backend/src/commissions/*.ts`, `apps/frontend/src/lib/api.ts`, `apps/frontend/src/routes/index.tsx`, `docs/**`, `CLAUDE.md`.
**Criterio de aceptación:** tenant Consultorio no ve menú ni puede llamar endpoints (402). Tenant Óptica Pro opera normal. Docs actualizados.
**Estimación:** 1 día.

### Comisiones y Métricas — Completadas ✅

- [x] Sesión 1: Fundación backend (migración 017 aplicada, `commissionRate` en User)
- [x] Sesión 2: Módulo commissions + 3 endpoints
- [x] Sesión 3: UI comisiones con export PDF (pdfmake)
- [x] Sesión 4: Métricas con Recharts + endpoint /sales/metrics
- [x] Sesión 5: Gating por plan + polish + docs

### Trabajo nocturno autónomo — 2026-04-18 (post-sesión)

Hecho mientras el usuario dormía. **Sin commits** — todo en working tree para revisión.

**Tech debt resuelto — 7 errores TypeScript pre-existentes que bloqueaban `npm run build`:**

- [x] `apps/frontend/src/pages/inventory/EditProductPage.tsx:93` — `product.imageUrl` no existía en el tipo `Product`; reemplazado por `product.images && product.images.length > 0`.
- [x] `apps/frontend/src/pages/inventory/InventoryPage.tsx:53-54` — filtros comparaban el enum con variantes `low_stock`/`out_of_stock` (underscore) que no existen; eliminadas, dejando solo `low-stock`/`out-of-stock` (guión).
- [x] `apps/frontend/src/pages/inventory/NewProductPage.tsx:12` — `showSuccess` destructurado pero nunca usado; eliminado junto con el import de `useSnackbar` (también no usado en el archivo).
- [x] `apps/frontend/src/pages/settings/ProfilePage.tsx:59,136,138` — referencias a `user.avatarUrl`/`{ avatarUrl: ... }` cuando `User` tiene `avatar`; renombrado las 3 ocurrencias a `avatar`.

**Resultado:** `npm run build` en apps/frontend → **exit 0 limpio**. Build completo genera bundle con `CommissionsPage` 13 kB, `MetricsPage` 408 kB, `pdfmake` 1 MB en chunk aparte (dynamic import, no pesa en carga inicial), `vfs_fonts` 855 kB idem.

**Nota:** el warning de chunk-size >500 kB es esperado por pdfmake/vfs_fonts (ambos lazy-loaded).

**Qué NO hice (a propósito):**
- **No hice commit.** La decisión de cómo commitear (1 solo commit vs. commits por sesión) queda para el usuario.
- **No corrí el dev server.** Dejar procesos vivos es riesgoso.
- **No ejecuté el smoke test end-to-end** (requiere login manual + navegación). El checklist de smoke test está en el reporte de Sesión 5.
- **No toqué nada fuera del tech debt flaggeado** (no refactors, no nuevos features).

### Riesgos y dependencias cross-session

- **pdfmake vs jsPDF:** pdfmake gana por tablas nativas + unicode (acentos, ñ, Bs). Pesa ~500KB gzipped → dynamic import al click de exportar.
- **Recharts vs Chart.js:** Recharts declarativo, mejor DX en React 19, tree-shakeable. Para volúmenes de una óptica (decenas de ventas/día) sobra.
- **Ventas `refunded` post-export:** sin snapshot, re-generar el mismo rango da otro número. Mitigación: timestamp y nota en el PDF.
- **Testing sin snapshots:** cálculo determinístico — script `scripts/verify-commissions.ts` compara sum manual vs endpoint sobre un rango fijo del seed.
- **Cambio de `commissionRate` a mitad de mes:** sin historización, ventas viejas recalculan con rate nuevo. Avisar con `ConfirmModal` antes de guardar.
- **Performance:** `groupBy` sobre `sales` filtrado por `tenant_id + date` necesita índice compuesto — agregado como bonus en Sesión 1.

### Preguntas abiertas (resolver antes de Sesión 2)

1. ¿Ventas `refunded` se descuentan del reporte del periodo en que ocurrió la venta original, o del periodo en que se hizo el refund? **Recomendación:** ajustar en el periodo del refund (más simple, más justo).
2. ¿Comisión se ajusta para ventas con tarjeta (fee bancario ~3%)? **Recomendación MVP:** no ajustar, mantener simple.
3. ¿Manager debería ver comisiones de su equipo en v2 (post-MVP)? Define quién hace cierres en ópticas >5 empleados.

### Roadmap post-MVP (upsells adyacentes, no construir todavía)

| Feature | Esfuerzo | Impacto | Notas |
|---|---|---|---|
| Dashboard "Mis ventas" óptico (sin montos) | Bajo | Medio | Engagement sin exponer comisiones |
| Metas mensuales + progreso | Medio | Alto | Argumento de venta fuerte; complementa comisiones |
| Comisión por tramos (tiered) | Medio | Alto | `[{hasta: 20000, rate: 3}, ...]` JSON en User — justifica tier Cadena |
| Spiff por producto/marca | Alto | Alto | Bono fijo por vender marca X; monetizable como add-on con proveedores |
| Export planilla sueldos (CSV) | Bajo | Medio | Cierra ciclo operativo |

**Métrica de decisión 3 meses post-launch:** si <30% de tenants Óptica Pro/Cadena activan la feature o el PDF no se descarga ≥1×/mes, degradar prioridad. Si >50% activa, habilitar roadmap de upsells arriba.

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
