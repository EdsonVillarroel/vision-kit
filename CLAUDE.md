# Vision Kit — Contexto para Claude

> **Propósito:** Archivo de instrucciones permanentes del proyecto Vision Kit para Claude Code.
> Describe la arquitectura, convenciones, stack tecnológico y reglas de mantenimiento
> del monorepo. Es la fuente de verdad operativa para el asistente.
>
> **Etapa de lectura:** Se carga automáticamente al inicio de **cada conversación** (project instructions).
> Léelo siempre antes de ejecutar cualquier tarea. Después de cualquier cambio estructural,
> actualiza este archivo y el doc correspondiente en `docs/` antes de terminar la tarea.

---

## Reglas de mantenimiento de documentación

### Tabla de actualización obligatoria

| Si el cambio afecta... | Actualizar... |
|------------------------|---------------|
| Nuevo feature, nueva página, nueva ruta, nuevo componente | `docs/PROJECT_STRUCTURE.md` + sección Frontend de este archivo |
| Nuevo módulo NestJS, nuevo controller, nuevo service | `docs/PROJECT_STRUCTURE.md` + sección Backend de este archivo |
| Nuevo modelo Prisma, nueva tabla, campo nuevo, relación nueva | `docs/DATABASE_STRUCTURE.md` + tabla de modelos de este archivo |
| Nuevo endpoint, nuevo query param, cambio en body/respuesta | `docs/API_ENDPOINTS.md` + contador de endpoints de este archivo |
| Nueva convención de código o patrón aprendido | sección Convenciones de este archivo |
| Nueva dependencia npm | sección Tech Stack de este archivo |
| Nuevo comando útil | sección Comandos clave de este archivo |
| Cambio de rol/permiso | tabla Roles y permisos de este archivo + `docs/PROJECT_STRUCTURE.md` |
| Decisión de arquitectura no obvia | `DECISIONS.md` |
| Feedback o corrección del usuario | crear/actualizar archivo en `memory/` |

### Protocolo por prompt — ejecutar al terminar cada respuesta

1. **¿Modifiqué código?** → Revisar si alguna fila de la tabla anterior aplica
2. **¿Actualizar?** → Hacerlo en la misma respuesta, no posponer
3. **¿Quedó algo obsoleto en un doc?** → Eliminarlo en el mismo update (no acumular deuda documental)
4. **¿Aprendí algo sobre preferencias del usuario?** → Guardar en `memory/`
5. **Cambio menor** (bug fix, texto, estilos locales) → no es necesario actualizar docs

### Reglas de limpieza — qué NO debe estar en los docs

- **`PROJECT_STRUCTURE.md`**: sin comentarios `← mock`, sin listas de archivos modificados (eso es git)
- **`AGENT.md`**: solo decisiones no obvias y gotchas; sin narrativa por sesión ni listas de "archivos modificados"
- **`CLAUDE.md`**: sin historial de cambios; solo estado actual del proyecto
- **`Tools.md`**: las secciones "Completado en sesión X" son válidas como kanban, pero si crecen demasiado, condensar las sesiones antiguas en una línea

---

## Estructura del monorepo

```
vision-kit/
├── apps/
│   ├── frontend/          ← React 19 + TypeScript + Vite + TailwindCSS v4 (panel interno de óptica)
│   ├── admin/             ← React 19 + TypeScript + Vite + TailwindCSS v4 (panel platform admin — puerto 5175)
│   ├── landing/           ← React 19 + TypeScript + Vite + TailwindCSS v4 (portal público vision-2020)
│   └── backend/           ← NestJS + Prisma + PostgreSQL
├── docs/
│   ├── PROJECT_STRUCTURE.md   ← árbol completo, rutas, convenciones
│   ├── DATABASE_STRUCTURE.md  ← Prisma schema + ERD + relaciones
│   └── API_ENDPOINTS.md       ← endpoints con body/params/respuestas
├── CLAUDE.md              ← este archivo (carga automática)
└── package.json           ← npm workspaces root
```

---

## Tech Stack

| App | Stack |
|-----|-------|
| Frontend (panel óptica) | React 19, TypeScript, Vite 7, React Router DOM v7, TailwindCSS v4, clsx |
| Admin (platform admin) | React 19, TypeScript, Vite 7, React Router DOM v7, TailwindCSS v4, clsx — puerto 5175 |
| Landing (público) | React 19, TypeScript, Vite 6, React Router DOM v7, TailwindCSS v4 |
| Backend | NestJS 10, Prisma 5, PostgreSQL (Supabase), JWT (Passport), bcrypt, class-validator, @nestjs/throttler, helmet |
| Base de datos | Supabase (PostgreSQL) — project ref: `fobfltxxsudplapdwlfj` |
| Monorepo | npm workspaces, concurrently |

---

## Comandos clave

```bash
npm run dev            # frontend (5173) + backend (3000) en paralelo
npm run dev:all        # frontend + backend + landing (5174) + admin (5175) en paralelo
npm run frontend       # solo Vite dev server (puerto 5173)
npm run backend        # solo NestJS (puerto 3000)
npm run landing        # solo landing dev server (puerto 5174)
npm run admin          # solo admin dev server (puerto 5175)
npm run db:migrate     # aplicar migraciones Prisma
npm run db:seed        # seed con usuarios, pacientes, productos, citas (Bolivia, BOB, IVA 13%)
npm run db:seed:plans  # seed con 7 filas en subscription_plans (4 tiers × mensual/anual)
npm run db:studio      # GUI Prisma Studio
npm run build          # build frontend + backend

# Supabase CLI (desde raíz del monorepo)
npx supabase migration new <nombre>   # nueva migración SQL
npx supabase db push                  # aplicar migraciones al remoto
npx supabase db pull                  # sync schema desde remoto
```

---

## Frontend — Arquitectura

**Patrón:** Feature-based modular. Cada feature vive en `apps/frontend/src/features/<nombre>/`:
```
<feature>/
├── components/    ← Componentes React
├── hooks/         ← Custom hooks (estado + efectos)
├── services/      ← Llamadas HTTP (actualmente mocks en memoria)
├── types/         ← Interfaces TypeScript
└── index.ts       ← Exports públicos del módulo
```

**Features existentes (frontend):** `auth`, `patients`, `medical-records`, `clinical-exams`, `appointments`, `inventory`, `sales`, `users`, `layout`, `subscription` (plan actual + `hasFeature()` + quota checks), `commissions` (reporte + export PDF con pdfmake), `metrics` (recharts: totales, series por día, top vendedores, mix de pagos)

---

## Admin — Arquitectura (`apps/admin/`)

Panel de gestión de la plataforma SaaS. Solo accesible para `platform_admins`. Usa `platform_token` en localStorage (separado de `auth_token` del frontend).

**Páginas:**
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` → `/dashboard` | `DashboardPage` | Stats globales: tenants, MRR, usuarios, pacientes |
| `/tenants` | `TenantsPage` | Tabla de tenants con filtros + suspend/activate |
| `/tenants/new` | `NewTenantPage` | Wizard 3 pasos: info → plan → credenciales super_admin |
| `/tenants/:id` | `ViewTenantPage` | Detalle: info, suscripción, uso de recursos |
| `/tenants/:id/edit` | `EditTenantPage` | Editar nombre, colores, dominio |
| `/plans` | `PlansPage` | Tabla de planes con toggle activo + link a editor |
| `/plans/:id/edit` | `EditPlanPage` | Editor completo: info, límites, features JSON (25 flags — booleans + cuotas + selects) |
| `/subscriptions` | `SubscriptionsPage` | Gestión de suscripciones + edit modal (plan, estado, notas QR) |

**API client:** `src/lib/api.ts` → usa `platform_token`; refresh via `POST /platform/auth/refresh`

**Auth:** `usePlatformAuth` hook + `PlatformAuthProvider` — separado del tenant auth

**Tema:** indigo fijo (CSS vars `--color-primary: #4f46e5`, `--color-accent: #8b5cf6`) — diferencia visual del panel de óptica

**Features:** `platform-auth`, `layout`, `tenants`, `plans`, `subscriptions`, `dashboard`

---

## Landing — Arquitectura (`apps/landing/`)

Portal público multi-tenant. Consume la Public API del backend (sin JWT). Rutas con prefijo `/:tenantSlug`.

**Páginas:**
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/:tenantSlug` | `HomePage` | Link-in-bio: logo, categorías, WhatsApp, redes — datos dinámicos desde `clinicInfo` |
| `/:tenantSlug/catalogo` | `CatalogPage` | Grid paginado con filtros de categoría + búsqueda |
| `/:tenantSlug/catalogo/:id` | `ProductPage` | Detalle: galería, specs, CTA WhatsApp + reserva |
| `/:tenantSlug/reservar` | `BookingPage` | Formulario de reserva → `POST /public/:tenantSlug/bookings` |

**Contexto:** `TenantLayout` (React Router Outlet) lee `tenantSlug` de URL params, fetch `getClinicInfo`, aplica `--brand` CSS var, provee `useTenant()` con `{ tenantSlug, clinicInfo, brandColor, path() }`

**API client:** `src/lib/api.ts` → `publicApi.getCatalog(slug, params)`, `getProduct(slug, id)`, `getClinicInfo(slug)`, `createBooking(slug, data)`

**Redirect:** `*` → `/vision-2020-hd` (slug por defecto)

**Variable de entorno:** `VITE_API_URL` (default: `http://localhost:3000/api/v1`)

**UI Components** (en `apps/frontend/src/components/ui/`): `Button`, `Input`, `Card`, `Badge`, `StatCard`, `Table`

**Páginas** en `apps/frontend/src/pages/<feature>/` — una página por ruta.

**Rutas** definidas en `apps/frontend/src/routes/index.tsx`.

**Tema** dark/light via CSS variables en `apps/frontend/src/theme/`.

---

## Backend — Arquitectura

**Patrón:** NestJS modular. Base URL: `http://localhost:3000/api/v1`

Cada módulo en `apps/backend/src/<modulo>/` tiene:
```
<modulo>/
├── <modulo>.module.ts
├── <modulo>.controller.ts    ← rutas HTTP
├── <modulo>.service.ts       ← lógica de negocio + Prisma
└── dto/                      ← validación con class-validator
```

**Auth tenant:** JWT Bearer token. Guards: `JwtAuthGuard` (strategy `'jwt'`) + `RolesGuard` (autorización). Payload: `{ sub, email, tenantId, role }`.

**Auth platform:** strategy `'jwt-platform'`, guard `PlatformAuthGuard`. Payload: `{ sub, email, type: 'platform' }`. Separado completamente de tenant auth.

**Módulos:** `auth`, `platform-auth`, `platform`, `users`, `patients`, `appointments`, `medical-records`, `clinical-exams`, `inventory`, `sales`, `commissions`, `settings`, `subscriptions`, `upload`, `public`, `health` (GET `/api/v1/health` — chequea DB, skip throttle, sin auth), `prisma` (global).

**JWT separado:** `JWT_SECRET` firma tokens de tenant (auth module); `JWT_PLATFORM_SECRET` firma tokens de platform admin (platform-auth module). Ambos son requeridos al boot — el server falla con error claro si falta alguno.

**Resiliencia:** `PrismaService.onModuleInit()` no es bloqueante: si la DB cae temporalmente al boot, el server arranca y `/health` reporta `degraded` (HTTP 503) en lugar de crash-loop.

**Docker:** `apps/backend/Dockerfile` multi-stage (deps → build → runtime alpine, ~700MB). Build context = raíz del monorepo. Usa tini como PID 1 para shutdown limpio + non-root user `nestjs`. `tsconfig.build.json` excluye `prisma/` para que `dist/main.js` quede en raíz.

**Observabilidad:**
- **Logger:** `nestjs-pino` reemplaza el logger por defecto. JSON estructurado en prod (consumible por Datadog/Loki/CloudWatch), pretty con colores en dev. Auto-redacta `authorization`, `cookie`, `password`, `passwordHash`. Cada request lleva `x-request-id` (UUID propagado en response header). Healthchecks no se loguean (`autoLogging.ignore`).
- **Sentry:** opt-in via `SENTRY_DSN`. Init antes de `NestFactory.create` para capturar errores de bootstrap. Tags automáticos: `requestId`, `tenantId`. Sample rate de traces configurable. Si `SENTRY_DSN` está vacío, queda deshabilitado (no falla).
- **AllExceptionsFilter** (global via `APP_FILTER`): sanitiza respuestas (no leak stack traces ni mensajes de Prisma al cliente), mapea errores conocidos de Prisma (`P2002`→409, `P2025`→404, `P2003`→400), incluye `requestId` en todas las respuestas de error. Solo errores **no-HttpException** (true unhandled) se reportan a Sentry — esto evita ruido por `ServiceUnavailableException` esperado del `/health`.

**Seguridad:** `helmet` (headers HTTP) + `@nestjs/throttler` (10/seg · 100/min · 1000/h global; `POST /public/:tenantSlug/bookings` con límite propio 2/10s · 3/min). CORS multi-origen via `CORS_ORIGINS` (separados por coma). `SubscriptionGuard` (APP_GUARD global) devuelve HTTP 402 si el tenant no está `active`. `PlanQuotaGuard` (por-handler con `@QuotaLimit('patients'|'products'|'sales_per_month'|'users')`) devuelve HTTP 402 + body `{ error: 'PlanQuotaExceeded', limit, current, planName }` al exceder el plan; cableado en `POST /patients`, `POST /inventory`, `POST /sales`. `PlanFeatureGuard` (por-handler/controller con `@PlanFeature('commissions')`) devuelve HTTP 402 + body `{ error: 'FeatureNotInPlan', feature, planSlug, planName }` cuando el flag booleano del plan no está activo; cableado en controller `commissions/*` y en `GET /sales/metrics`. Rutas sin tenantId en CLS (public/platform) se saltan. RLS habilitado en todas las tablas via migración 015.

**Total endpoints:** 69 (43 tenant + 1 subscriptions + 1 sales/metrics + 3 commissions + 4 public + 3 platform-auth + 13 platform-management + 1 health) — ver `docs/API_ENDPOINTS.md`

**Tests:** Jest. 41 tests críticos en `apps/backend/src/**/*.spec.ts`:
- `auth.service.spec.ts` — login OK, password incorrecto, usuario inexistente/inactivo, garantiza que `passwordHash` NUNCA se filtra en respuestas.
- `subscription.guard.spec.ts` — pasa sin tenantId (rutas public/platform), suspended → 402, cache 5 min funciona.
- `plan-quota.guard.spec.ts` — sin decorator → pasa, sin sub → 402, dentro de límite → pasa, exceso → 402 con body `PlanQuotaExceeded`, UNLIMITED (-1) → pasa, `sales_per_month` lee `features.max_sales_per_month`.
- `tenant-prisma.service.spec.ts` — el más crítico para aislamiento: verifica que el query extension inyecta `tenantId` en `where` (find/update/delete/count/aggregate/groupBy), en `data` (create/createMany), en `where + create` (upsert pero NO en update); NO inyecta en `findUnique` (rompería unique constraints), en modelos no scoped (`Tenant`, `SubscriptionPlan`), ni en rutas sin tenantId en CLS. Cubre los 16 modelos en `TENANT_SCOPED_MODELS`. Cobertura del archivo: 100% líneas, 95% branches.
- Comando: `npm test --workspace=apps/backend` o `cd apps/backend && npx jest`. Coverage: `npm test -- --coverage`.

**CI/CD:** `.github/workflows/ci.yml` — en cada PR/push a `main`:
- Job `validate` (matrix: backend, frontend, admin, landing): `npm ci` + `prisma generate` (solo backend) + `lint` + `test` (solo backend) + `build` por app en paralelo. `fail-fast: false` para diagnóstico completo.
- Job `docker-publish-backend` (solo en push a `main`): builda `apps/backend/Dockerfile` y pushea a `ghcr.io/edsonvillarroel/vision-kit-backend` con tags `latest` + `sha-<short>`. Usa `cache: type=gha` para builds incrementales (~1–2 min después del primer build).
- `concurrency` cancela runs anteriores del mismo branch — ahorra CI minutes en pushes rápidos.

**Deployment:**
- Backend: **Render** (recomendado — free tier sin tarjeta, sostenible; Blueprint `render.yaml` construye `apps/backend/Dockerfile` desde GitHub; se duerme tras 15 min → cold start ~50s). Secretos (JWT + Supabase pooler URLs) en `env.yaml` local (gitignored), se pegan en Render como vars `sync: false`. Alternativas: Cloud Run (requiere tarjeta) / Railway / Fly.io. Healthcheck `/api/v1/health`. Ver `docs/DEPLOYMENT.md` §3.
- Frontend/Admin/Landing: **Firebase Hosting** multi-site (config en `firebase.json` + `.firebaserc`, project `vision2020-8df81`). Sites: `vision-kit` (frontend), `vision-2020-hd` (landing), `vision-kit-admin` (admin) → `*.web.app`. Deploy con `npm run deploy:hosting` (o `deploy:frontend`/`deploy:landing`/`deploy:admin`). Cada app lee `VITE_API_URL` desde su `.env.production` (gitignored). SPA rewrite + headers de seguridad definidos por site. Alternativa: `vercel.json` (aún presente en cada app).
- Stack de dev local: `docker-compose -f docker-compose.dev.yml up` (Postgres aislado en :5433 + backend con healthcheck + auto-deps).
- Scripts útiles: `scripts/generate-secrets.sh` (genera `JWT_SECRET` + `JWT_PLATFORM_SECRET` con `openssl rand -base64 64`); `scripts/verify-rls.sql` (audita que todas las tablas tengan RLS habilitado).
- Plan paso-a-paso: `docs/DEPLOYMENT.md` (incluye smoke test crítico de aislamiento multi-tenant).

**Audit cross-tenant (pasado):** los 9 services de negocio (`patients`, `appointments`, `medical-records`, `clinical-exams`, `inventory`, `sales`, `commissions`, `settings`, `users`) usan EXCLUSIVAMENTE `tenantPrisma.client` (70 queries auto-scoped, 0 directas a `this.prisma`). Los usos directos en `auth`/`platform`/`public`/`subscriptions` son intencionales (login pre-context, operaciones cross-tenant del admin global, rutas públicas con `tenantId` derivado del slug).

---

## Roles y permisos

### Roles de tenant (tabla `profiles`)

| Rol | Acceso |
|-----|--------|
| `super_admin` | Todo dentro del tenant — creado solo vía provisioning |
| `admin` | Todo — usuarios, configuración, eliminar cualquier cosa |
| `manager` | Ventas, pacientes, inventario, reportes, ver usuarios |
| `optician` | Ventas, pacientes, historiales, citas, exámenes clínicos |

### Platform admins (tabla `platform_admins`)

| Rol | Acceso |
|-----|--------|
| Platform Admin | Gestión de tenants, suscripciones, planes — separado de tenant users |

---

## Base de datos — Modelos Prisma

> **Fuente de verdad:** `apps/backend/prisma/schema.prisma`
> La tabla `profiles` en Supabase sirve como tabla de usuarios del backend NestJS.
> Prisma model `User` → tabla `profiles` (via `@@map("profiles")`).
> Enums con guiones en DB se mapean con `@map` en Prisma (ej: `eye_exam @map("eye-exam")`).

### Tablas multi-tenant (nuevas)

| Tabla DB | Modelo Prisma | Descripción |
|----------|---------------|-------------|
| `tenants` | `Tenant` | Cada óptica es un tenant — slug, colores, dominio |
| `subscription_plans` | `SubscriptionPlan` | 4 tiers: Escaparate (free), Consultorio (Bs 249), Óptica Pro (Bs 549), Cadena (Bs 1,199) — mensual y anual (-20%). Seed en `prisma/seedPlans.ts`. |
| `subscriptions` | `Subscription` | Relación tenant ↔ plan con estado y fechas |
| `platform_admins` | `PlatformAdmin` | Admins de la plataforma SaaS — separados de users |

### Tablas de negocio (todas con `tenant_id NOT NULL`)

| Tabla DB | Modelo Prisma | Descripción |
|----------|---------------|-------------|
| `profiles` | `User` | Usuarios del tenant — `tenant_id` NOT NULL |
| `patients` | `Patient` | `@@unique([tenantId, identificationId])` |
| `patient_insurances` | `PatientInsurance` | Datos de seguro (1:1 con patient) |
| `patient_emergency_contacts` | `PatientEmergencyContact` | Contacto emergencia (1:1 con patient) |
| `appointments` | `Appointment` | `@@unique([tenantId, appointmentNumber])` |
| `medical_records` | `MedicalRecord` | Historial clínico — columnas planas |
| `clinical_exams` | `ClinicalExam` | `@@unique([tenantId, examNumber])` |
| `products` | `Product` | `@@unique([tenantId, sku])` |
| `product_specifications` | `ProductSpecification` | Specs técnicas (1:1 con product) |
| `product_suppliers` | `ProductSupplier` | Proveedor (1:1 con product) |
| `stock_movements` | `StockMovement` | Entradas/salidas/ajustes de stock |
| `sales` | `Sale` | `@@unique([tenantId, saleNumber])` |
| `sale_items` | `SaleItem` | Líneas de venta (snapshot nombre+SKU) |
| `payments` | `Payment` | Pagos individuales (pago mixto) |
| `clinic_settings` | `ClinicSettings` | `@@unique([tenantId])` — uno por tenant |
| `public_bookings` | `PublicBooking` | Reservas online del portal público |

---

## Convenciones

- **Archivos:** PascalCase para componentes `.tsx`, camelCase para todo lo demás `.ts`
- **Feature index:** cada feature exporta solo lo público desde `index.ts`
- **Tipos:** siempre en `types/index.ts` del feature
- **Hooks:** encapsulan estado + llamadas al service; los componentes solo usan hooks
- **DTOs backend:** validación con `class-validator`, `PartialType` para updates
- **Nunca** exponer el campo `passwordHash` en respuestas — usar `select` en Prisma
- **Rutas protegidas:** `JwtAuthGuard` en el controller, `RolesGuard` solo cuando se necesita rol específico
- **Stock:** al ajustar stock, recalcular automáticamente el `status` del producto

---

## Swagger / OpenAPI

- **URL:** `http://localhost:3000/api/docs`
- Bearer auth persistente entre recargas (`persistAuthorization: true`)
- 10 tags: auth, users, patients, appointments, medical-records, clinical-exams, inventory, sales, settings, subscriptions
- Todos los controllers decorados con `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`
- DTOs principales decorados con `@ApiProperty` + ejemplos reales

---

## Archivos de referencia detallados

| Archivo | Contenido |
|---------|-----------|
| `docs/PROJECT_STRUCTURE.md` | Árbol completo (3 apps), rutas, roles |
| `docs/DATABASE_STRUCTURE.md` | Prisma schema + ERD + mapeos + historial de migraciones |
| `docs/API_ENDPOINTS.md` | 47 endpoints con body/params/respuestas |
| `docs/BUSINESS_PLAN.md` | Plan de negocio, 4 tiers de suscripción, add-ons, roadmap 3-6 meses, métricas SaaS |
| `DECISIONS.md` | Decisiones de arquitectura con razonamiento — leer antes de cambios estructurales |
| `AGENT.md` | Gotchas técnicos y decisiones condensadas |
| `Tools.md` | Tareas completadas por sesión + pendientes actuales |

---

## Usuarios seed (contraseña: 123456)

### Tenant users (tenant: Visión 20/20 HD)

| Email | Rol |
|-------|-----|
| admin@visionkit.com | admin |
| gerente@visionkit.com | manager |
| optico1@visionkit.com | optician |
| optico2@visionkit.com | optician |

### Platform admin

| Email | Tipo |
|-------|------|
| platform@visionkit.com | Platform Admin |

### Tenant default

| ID | Nombre | Slug | Plan |
|----|--------|------|------|
| `00000000-0000-4000-a000-000000000001` | Visión 20/20 HD | `vision-2020-hd` | Profesional |
