# Vision Kit — AGENT.md
# Misiones cumplidas por el agente Claude

> Registro cronológico de lo que se construyó, decidió y resolvió.
> Útil para retomar contexto en futuras conversaciones.

---

## Sesión 1 — 2026-03-28

### Exploración inicial y contexto del proyecto
- Analizado el proyecto completo: React 19 + TypeScript + Vite (frontend) con toda la data en memoria (mock).
- Identificada la arquitectura feature-based del frontend con 8 módulos: auth, patients, medical-records, clinical-exams, appointments, inventory, sales, users.

### Integración de Supabase como base de datos
- Instalado Supabase CLI como dev dependency del monorepo.
- Ejecutado `supabase init` y `supabase link` al proyecto remoto `fobfltxxsudplapdwlfj`.
- Creadas y aplicadas **6 migraciones SQL** al remoto:

| Migración | Contenido |
|-----------|-----------|
| `001_create_profiles_and_patients` | Tabla `profiles` (con trigger auth), tabla `patients`, enums de rol/género/status |
| `002_create_inventory` | Tabla `products` (JSONB specs), `stock_movements`, enums de categoría/status |
| `003_create_appointments_and_records` | `appointments`, `medical_records` (JSONB), `clinical_exams` (JSONB) |
| `004_create_sales` | `sales`, `sale_items`, `payments`, enums de método/status |
| `005_rls_policies` | RLS en todas las tablas + Storage buckets `avatars` y `product-images` |
| `006_align_with_prisma` | Alineación completa con Prisma: tablas normalizadas, columnas planas, enum fixes |

### Cambio de arquitectura a monorepo
- El proyecto pasó de SPA simple a monorepo npm workspaces con `apps/frontend` y `apps/backend`.
- Backend: NestJS 10 + Prisma 5 con 9 módulos y 40 endpoints REST.

### Alineación Supabase ↔ Prisma (migración 006)
**Problema:** Las primeras 5 migraciones usaban JSONB y tablas flat. El schema de Prisma esperaba columnas planas y tablas normalizadas.

**Solución aplicada:**
- Removida FK `profiles.id → auth.users` (NestJS gestiona auth propio).
- Añadido `password_hash` a `profiles`.
- Creadas tablas normalizadas: `patient_insurances`, `patient_emergency_contacts`, `product_specifications`, `product_suppliers`, `clinic_settings`.
- `medical_records` y `clinical_exams`: JSONB → 20+ columnas planas cada una.
- `products`: eliminado JSONB `specifications` y campos inline de supplier; agregado array `images`.
- `product_status` enum: añadidos `in_stock`, `low_stock`, `discontinued`.
- Columnas faltantes: `cancellation_reason` en appointments, `prescription_required`/`warranty_expiry_date`/`warranty_terms` en sales.
- `stock_movements.date`: tipo `timestamptz` → `date`.

**Cambios en Prisma schema:**
- `User` model → `@@map("profiles")` + `passwordHash` (`@map("password_hash")`).
- Todos los campos con `@map()` para snake_case del DB.
- Enums con `@map()` para valores con guiones: `eye_exam @map("eye-exam")`, `contact_lenses @map("contact-lenses")`, etc.

**Cambios en NestJS:**
- `auth.service.ts`: `user.password` → `user.passwordHash`.
- `users.service.ts`: `password:` → `passwordHash:` al crear usuario.
- `prisma/seed.ts`: `password:` → `passwordHash:`.

### Configuración del entorno backend
- Creado `apps/backend/.env` con `DATABASE_URL` (pooling PgBouncer) y `DIRECT_URL` (conexión directa).
- Regenerado Prisma Client con `npx prisma generate`.

### Swagger / OpenAPI
- Instalado `@nestjs/swagger`.
- Configurado en `main.ts`: título, descripción, versión, `addBearerAuth`, 9 tags.
- Disponible en `http://localhost:3000/api/docs` con `persistAuthorization`.
- Decorados todos los **controllers** con `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiQuery`, `@ApiResponse`.
- Decorados DTOs principales con `@ApiProperty` / `@ApiPropertyOptional` con ejemplos reales.

### Archivos de contexto creados/actualizados
- `CLAUDE.md`: actualizado con Supabase, comandos CLI, tabla de modelos mejorada, convención `passwordHash`.
- `docs/DATABASE_STRUCTURE.md`: reescrito con arquitectura dual (Supabase + Prisma), mapeos, enums, flujo de migraciones.
- `AGENT.md`: este archivo.
- `memory/`: proyecto guardado en sistema de memoria del agente.

---

## Decisiones de arquitectura tomadas

| Decisión | Razonamiento |
|----------|-------------|
| Prisma schema como fuente de verdad | NestJS necesita tipo safety; adaptar Supabase a Prisma fue más limpio que reescribir servicios |
| `profiles` tabla para NestJS auth (sin FK a auth.users) | Elimina dependencia de Supabase Auth en el flujo NestJS; ambos sistemas coexisten |
| Columnas planas en medical_records/clinical_exams | Mejor type safety en Prisma; queries más eficientes que JSONB |
| Supabase CLI para migraciones (no `prisma migrate`) | Prisma solo como ORM; Supabase CLI gestiona el DDL con RLS y políticas |
| `directUrl` en Prisma datasource | PgBouncer (pooling) no soporta migraciones; `directUrl` las bypasea |

---

## Sesión 2 — 2026-03-28

### Conexión frontend ↔ backend y verificación funcional

**Punto de partida:** Backend construido en sesión anterior, frontend con servicios ya escritos apuntando a `localhost:3000`. Pendiente conectar y verificar.

### Problemas encontrados y resueltos

| Problema | Causa | Fix |
|----------|-------|-----|
| `package.json` raíz con `<<<<<<` merge conflict | Rama antigua vs monorepo | Resuelto a favor de scripts monorepo |
| `type "public.UserRole" does not exist` | Prisma busca enums por su nombre PascalCase, DB los tiene en snake_case | Añadido `@@map("user_role")` et al. a todos los enums en `schema.prisma` |
| `profiles.status` era `text` con check constraint | Migración 001 no usó enum | Migración 007: crea `user_status` enum, altera columna, drop check constraint |
| `npx prisma generate` instalaba Prisma 7 | Prisma 7 tiene breaking changes con el datasource | Usar `./node_modules/.bin/prisma generate` en vez de `npx` |
| `seed.ts` usaba `id: 'default'` para ClinicSettings | UUID inválido | Cambiado a `00000000-0000-0000-0000-000000000001` |
| `avatar` → `avatarUrl` en 4 archivos backend | Typo/naming incorrecto | Renombrado en `users.service.ts`, DTOs y `auth.service.ts` |
| `auth.module.ts` exportaba `JwtAuthGuard` sin importarlo | Referencia sin import | Importado y añadido a providers |
| Frontend hook `useAppointments` pasaba 2 args a `create(data, createdBy)` | Firma del servicio acepta solo 1 | Eliminado arg `createdBy` del hook |
| `userService.toggleStatus(userId)` faltaba `currentStatus` | Firma requiere 2 params | `UsersPage` ahora lee el status del usuario antes de llamar |

### Estado final verificado
- `POST /auth/login` → retorna JWT + user object ✅
- `GET /auth/me` → retorna usuario autenticado ✅
- `GET /users` → retorna los 4 usuarios seed ✅
- `401` sin token en endpoints protegidos ✅
- Frontend build sin errores TypeScript ✅
- `npm run dev` levanta frontend (5173) + backend (3000) ✅

### Archivos creados/modificados
- `apps/frontend/.env.local` — `VITE_API_URL`
- `apps/frontend/src/lib/api.ts` — usa `import.meta.env.VITE_API_URL` con fallback
- `apps/backend/prisma/schema.prisma` — `@@map` en todos los enums
- `apps/backend/prisma/seed.ts` — UUID fijo para ClinicSettings
- `supabase/migrations/20260328164602_007_fix_enum_types.sql` — enum `user_status`
- `package.json` — conflicto de merge resuelto
- Múltiples fixes de `avatar` → `avatarUrl` en backend

---

## Sesión 3 — 2026-03-29

### Datos de prueba, correcciones de integración y Dashboard real

**Objetivo:** Continuar los próximos pasos del Tools.md: datos de prueba, conexión frontend↔backend, mejoras detectadas.

### Seed expandido

`apps/backend/prisma/seed.ts` reescrito con datos reales:
- **5 pacientes** con insurance, emergency contacts, condiciones médicas
- **8 productos** de inventario con especificaciones y proveedores (frames, lentes, contactos, accesorios, soluciones)
- **5 citas** para hoy, mañana y próxima semana con practitioners reales

**Problemas encontrados al ejecutar seed:**
- `findFirst` / `upsert` sobre `appointments` fallaba con error `08P01` (insufficient data) por PgBouncer
  → Solucionado con `$executeRawUnsafe` + `ON CONFLICT DO NOTHING`
- `appointments.patient_name NOT NULL` del schema original bloqueaba INSERT
  → Migración 008 aplica `ALTER TABLE ... DROP NOT NULL` en esa columna
- Enums en DB usan guiones (`eye-exam`, `in-progress`) vs Prisma que los expone con underscore
  → Mapeados manualmente antes de pasar a SQL raw

### Nuevas migraciones aplicadas

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260329000000_008_fix_appointments_nullable.sql` | `patient_name` nullable en `appointments` |
| `supabase/migrations/20260329000001_009_sale_cancellation_reason.sql` | Nueva columna `cancellation_reason` en `sales` |

### cancellationReason en Sale
- Campo `cancellationReason` añadido al modelo Prisma `Sale`
- `sales.service.ts → updateStatus()` ahora lo usa en vez de `notes`
- Prisma Client regenerado

### getSummary() completo
`sales.service.ts → getSummary()` ampliado con:
- `topProducts` (top 5 por cantidad vendida)
- `salesByMethod` (agrupado por método de pago)
- `salesByDay` (ventas diarias ordenadas por fecha)

### Dashboard con datos reales
`DashboardPage.tsx` reemplazado — ahora carga con `Promise.allSettled`:
- `GET /patients` → total de pacientes
- `GET /appointments?date=hoy` → citas del día + lista de citas pendientes/confirmadas
- `GET /inventory/alerts` → count de productos con stock bajo/agotado
- `GET /sales/summary?from=inicio-mes&to=hoy` → revenue del mes + top productos vendidos

### Tipo Patient corregido
`address`, `city`, `state`, `zipCode`, `phone` marcados como opcionales en el tipo frontend para alinearse con el schema Prisma (todos son `String?`).

### Estado final verificado
- `npm run db:seed` → 4 users, 5 patients, 8 products, 5 appointments ✅
- `tsc --noEmit` en frontend y backend → sin errores ✅
- Dashboard muestra stats reales (0 ventas hasta que se creen) ✅

### Archivos modificados
- `apps/backend/prisma/seed.ts` — seed completo con datos de prueba
- `apps/backend/prisma/schema.prisma` — campo `cancellationReason` en `Sale`
- `apps/backend/src/sales/sales.service.ts` — `getSummary()` completo + `cancellationReason`
- `apps/frontend/src/pages/dashboard/DashboardPage.tsx` — conectado a API real
- `apps/frontend/src/features/patients/types/index.ts` — campos opcionales alineados
- `supabase/migrations/008_fix_appointments_nullable.sql` — nueva migración
- `supabase/migrations/009_sale_cancellation_reason.sql` — nueva migración
- `Tools.md` — fixes registrados, pendientes actualizados

---

## Sesión 4 — 2026-03-29

### Objetivo: Conectar las 4 páginas con datos mock y completar lógica de negocio en backend

### Páginas conectadas a API real

| Página | Ruta | Cambio |
|--------|------|--------|
| `InventoryPage` | `/inventory/products` | Conectada a `useInventory(filters)` — stats calculadas del array real, filtros por categoría/estado/búsqueda |
| `SalesPage` | `/sales/reports` | Conectada a `useSales()` + `useSalesSummary()` — stats del mes + tabla con filtros de fecha/estado/búsqueda |
| `ClinicPage` | `/settings/clinic` | Carga desde `GET /settings` y guarda con `PATCH /settings` — nuevo `settingsService.ts` creado |
| `ProfilePage` | `/settings/profile` | Guarda con `userService.update()` y actualiza el contexto auth + localStorage |

### Nuevo servicio creado
- `apps/frontend/src/features/settings/services/settingsService.ts` — `get()` y `update()` para configuración de clínica

### AuthContext extendido
- `updateUser(updates: Partial<User>)` añadido al contexto y al `AuthProvider` — actualiza `user` en estado + `auth_user` en localStorage sin requerir re-login

### Backend: lógica de negocio en `sales.service.ts create()`
Dos operaciones añadidas tras crear la venta:
1. **Auto-descuento de stock** — por cada ítem vendido: `product.stock -= quantity`, recalcula `status` (`in_stock`/`low_stock`/`out_of_stock`), crea `StockMovement` de tipo `out` con referencia al `saleNumber`
2. **Actualiza paciente** — `visitCount += 1` y `totalSpent += total` con `increment` de Prisma

### Estado final verificado
- `tsc --noEmit` frontend → sin errores ✅
- `tsc --noEmit` backend → sin errores ✅
- 0 páginas con datos mock (31/31 conectadas) ✅

### Archivos modificados
- `apps/frontend/src/pages/inventory/InventoryPage.tsx` — conectado a API real
- `apps/frontend/src/pages/sales/SalesPage.tsx` — conectado a API real
- `apps/frontend/src/pages/settings/ClinicPage.tsx` — conectado a API real
- `apps/frontend/src/pages/settings/ProfilePage.tsx` — conectado a API real
- `apps/frontend/src/features/settings/services/settingsService.ts` — nuevo
- `apps/frontend/src/features/auth/hooks/useAuth.tsx` — `updateUser` añadido
- `apps/backend/src/sales/sales.service.ts` — auto-descuento stock + visitCount/totalSpent
- `Tools.md` — pendientes actualizados, mejoras detectadas añadidas

---

## Sesión 5 — 2026-03-29

### Objetivo: Ejecutar todos los ítems pendientes de Tools.md (prioridades alta y media técnica)

### Cambios implementados

#### 1. Revertir stock al cancelar/reembolsar venta
- `sales.service.ts → updateStatus()`: ahora acepta `performedById`, revierte stock (crea `StockMovement 'in'`) y decrementa `visitCount`/`totalSpent` del paciente cuando `status → cancelled/refunded` (solo si venía de `pending` o `completed`)
- `sales.controller.ts`: añadido `@Req()` para pasar `req.user.id` como `performedById`

#### 2. SalesPage filtro de fecha server-side
- `useSales(dateFrom?, dateTo?)`: acepta fechas y las pasa a `salesService.getAll()`
- `SalesPage`: `dateFilter` se pasa como `from`/`to` al backend (mismo valor = día exacto); filtro local por fecha eliminado

#### 3. Endpoint PATCH /users/:id/password
- `users/dto/change-password.dto.ts`: nuevo DTO con `currentPassword` + `newPassword (min 6 chars)`
- `users.service.ts → changePassword()`: valida contraseña actual con bcrypt, hashea la nueva
- `users.controller.ts`: nuevo endpoint `PATCH :id/password` — solo propio usuario o admin
- `userService.ts` (frontend): método `changePassword()`
- `ProfilePage.tsx`: sección Seguridad ahora muestra formulario funcional en lugar de botón deshabilitado

#### 4. businessHours en ClinicSettings
- Migración 010 (`ALTER TABLE clinic_settings ADD COLUMN business_hours JSONB`) — aplicada
- `prisma/schema.prisma`: campo `businessHours Json? @map("business_hours")`
- `update-settings.dto.ts`: campo `businessHours` con validación `@IsObject()`
- `settingsService.ts` (frontend): tipos `DaySchedule`, `BusinessHours`, `DEFAULT_BUSINESS_HOURS`
- `ClinicPage.tsx`: sección "Horarios de Atención" ahora es editable (time inputs + checkbox Cerrado por día)

#### 5. Code splitting
- `routes/index.tsx` reescrito con `React.lazy()` + `Suspense` — todos los ~35 componentes de página son lazy loaded
- `PageLoader` spinner local como fallback de Suspense

#### 6. Error Boundary global
- `components/ErrorBoundary.tsx`: class component con `getDerivedStateFromError` + `componentDidCatch`
- `App.tsx`: wrapeado con `<ErrorBoundary>` como primer nivel

### Verificación
- `tsc --noEmit` frontend → sin errores ✅
- `tsc --noEmit` backend → sin errores ✅
- Migración 010 aplicada a Supabase ✅
- Prisma Client regenerado ✅

### Archivos modificados
- `apps/backend/src/sales/sales.service.ts` — stock revert en updateStatus
- `apps/backend/src/sales/sales.controller.ts` — @Req() en updateStatus
- `apps/backend/src/users/dto/change-password.dto.ts` — nuevo
- `apps/backend/src/users/users.service.ts` — changePassword
- `apps/backend/src/users/users.controller.ts` — PATCH :id/password
- `apps/backend/prisma/schema.prisma` — businessHours en ClinicSettings
- `apps/backend/src/settings/dto/update-settings.dto.ts` — businessHours
- `supabase/migrations/20260329000002_010_add_business_hours.sql` — nueva migración
- `apps/frontend/src/features/sales/hooks/useSales.tsx` — acepta dateFrom/dateTo
- `apps/frontend/src/pages/sales/SalesPage.tsx` — server-side date filter
- `apps/frontend/src/pages/settings/ProfilePage.tsx` — cambio de contraseña funcional
- `apps/frontend/src/pages/settings/ClinicPage.tsx` — businessHours editable
- `apps/frontend/src/features/settings/services/settingsService.ts` — tipos BusinessHours
- `apps/frontend/src/features/users/services/userService.ts` — changePassword
- `apps/frontend/src/routes/index.tsx` — code splitting lazy
- `apps/frontend/src/components/ErrorBoundary.tsx` — nuevo
- `apps/frontend/src/App.tsx` — ErrorBoundary wrapper
- `Tools.md`, `AGENT.md`, `CLAUDE.md` — docs actualizados

---

## Sesión 6 — 2026-03-29

### Objetivo: Upload de imágenes a Supabase Storage

### Cambios implementados

- `apps/backend/src/upload/` — nuevo módulo NestJS con `UploadController` + `UploadService`
- Endpoints: `POST /upload/avatar/:userId` y `POST /upload/product-image/:productId`
- Avatars: bucket `avatars` (privado), URL firmada con expiración de 1 año
- Product images: bucket `product-images` (público), URL pública directa
- Acceso a Storage via `service_role` key (bypassa RLS) — nunca exponer esta key al frontend
- Frontend `uploadService.ts`: cliente para los dos endpoints
- `EditProductPage` y `ProfilePage` actualizados para usar upload real

### Verificación
- `tsc --noEmit` frontend + backend → sin errores ✅
- Storage buckets existentes en Supabase confirmados ✅

### Archivos nuevos/modificados
- `apps/backend/src/upload/upload.module.ts`
- `apps/backend/src/upload/upload.controller.ts`
- `apps/backend/src/upload/upload.service.ts`
- `apps/backend/src/app.module.ts` — UploadModule añadido
- `apps/frontend/src/lib/uploadService.ts` — nuevo
- `apps/frontend/src/pages/inventory/EditProductPage.tsx` — upload de imagen
- `apps/frontend/src/pages/settings/ProfilePage.tsx` — upload de avatar

---

## Sesión 7 — 2026-03-29

### Objetivo: Loading skeletons en todas las páginas

### Cambios implementados

- `apps/frontend/src/components/ui/Skeleton.tsx` — nuevo componente con 7 variantes:
  - `Skeleton` (base), `SkeletonStatValue`, `SkeletonTableRows`, `SkeletonListItems`, `SkeletonDetailCard`, `SkeletonFormCard`, `SkeletonPageWithStats`
- Exportadas desde `ui/index.ts`
- **20 páginas** actualizadas para reemplazar spinners/texto plano con skeletons:
  - `DashboardPage` — stat cards + paneles de citas/productos
  - `InventoryPage`, `SalesPage` — stat cards + tablas
  - `ClinicPage`, `UserFormPage` — form skeletons
  - `UsersPage` — page with stats skeleton
  - View pages (Patient, Sale, Product, MedicalRecord, ClinicalExamDetails) — `SkeletonDetailCard`
  - Edit pages (Patient, Product, MedicalRecord, ClinicalExam, AdjustStock) — `SkeletonFormCard`
  - Specialized lists (Alerts, StockControl, Frames, Lenses) — `SkeletonPageWithStats`
- 0 spinners `animate-spin` ni textos "Cargando..." restantes en pages/

### Archivos modificados
- `apps/frontend/src/components/ui/Skeleton.tsx` — nuevo
- `apps/frontend/src/components/ui/index.ts` — exports añadidos
- 20 archivos de página en `apps/frontend/src/pages/`

---

## Sesión 8 — 2026-03-30

### Objetivo: Portal público `apps/landing` + Public API en backend

### Arquitectura introducida

**Nuevo workspace `apps/landing`** — portal público de Visión 20/20 HD (óptica en Santa Cruz, Bolivia). Consume la Public API del backend sin autenticación.

**Módulo `public` en backend** — 4 endpoints sin JWT:
| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/public/catalog` | Productos en stock, paginado, filtro por categoría/búsqueda |
| `GET /api/v1/public/catalog/:id` | Detalle de producto |
| `GET /api/v1/public/clinic` | Info pública de la clínica (sin taxRate, rfc, etc.) |
| `POST /api/v1/public/bookings` | Crear reserva anónima → tabla `public_bookings` |

**Seguridad implementada:**
- `helmet` — cabeceras HTTP de seguridad (XSS, sniffing, clickjacking)
- `@nestjs/throttler` — 3 ventanas: 10/seg · 100/min · 1000/h (global via `APP_GUARD`)
- `POST /public/bookings` con override más estricto: 2/10s · 3/min
- CORS multi-origen via `CORS_ORIGINS` (separados por coma) con fallback a `CORS_ORIGIN`

**DB: `PublicBooking` model + migración 011**
- Tabla `public_bookings` con RLS + trigger `updated_at`
- Campos: name, phone, email?, serviceType, preferredDate, preferredTime?, notes, status (pending/confirmed/cancelled)
- Aplicada directamente en Supabase + Prisma regenerado

**Landing (`apps/landing`) — 4 páginas:**
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | `HomePage` | Link-in-bio: logo, categorías, CTA reserva, WhatsApp, redes sociales |
| `/catalogo` | `CatalogPage` | Grid paginado, chips de categoría, búsqueda con debounce 400ms |
| `/catalogo/:id` | `ProductPage` | Galería con dots, specs, CTA WhatsApp + reserva |
| `/reservar` | `BookingPage` | Formulario completo + confirmación + CTA WhatsApp post-envío |

**Integración en monorepo:**
- `package.json` raíz: workspace `apps/landing` añadido
- Scripts: `npm run landing` (dev solo landing), `npm run dev:all` (frontend + backend + landing), `npm run build:landing`
- Build de producción: 642ms, 0 errores TypeScript

### Decisiones técnicas
- `PublicBooking` separado de `Appointment` porque las citas del sistema requieren FK a Patient y User; las reservas públicas son anónimas y el staff las convierte en citas reales
- `serviceType` es `String` libre (no enum) — el público ve texto legible, el staff mapea al tipo interno al confirmar
- Landing como workspace en monorepo (no repo separado) — facilita CI/CD compartido y variables de entorno coherentes

### Archivos nuevos/modificados
- `apps/backend/src/public/` — módulo completo (nuevo)
- `apps/backend/src/main.ts` — helmet, CORS multi-origen, tag Swagger `public`
- `apps/backend/src/app.module.ts` — ThrottlerModule, APP_GUARD, PublicModule
- `apps/backend/prisma/schema.prisma` — `PublicBooking` + `BookingStatus`
- `supabase/migrations/20260330005600_add_public_bookings.sql` — nueva
- `apps/landing/` — workspace completo (nuevo)
- `package.json` raíz — workspace + scripts landing
- `CLAUDE.md`, `Tools.md`, `AGENT.md`, `memory/` — docs actualizados
