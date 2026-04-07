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
│   ├── frontend/          ← React 19 + TypeScript + Vite + TailwindCSS v4 (panel interno)
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
| Frontend (panel) | React 19, TypeScript, Vite 7, React Router DOM v7, TailwindCSS v4, clsx |
| Landing (público) | React 19, TypeScript, Vite 6, React Router DOM v7, TailwindCSS v4 |
| Backend | NestJS 10, Prisma 5, PostgreSQL (Supabase), JWT (Passport), bcrypt, class-validator, @nestjs/throttler, helmet |
| Base de datos | Supabase (PostgreSQL) — project ref: `fobfltxxsudplapdwlfj` |
| Monorepo | npm workspaces, concurrently |

---

## Comandos clave

```bash
npm run dev            # frontend (5173) + backend (3000) en paralelo
npm run dev:all        # frontend + backend + landing (5174) en paralelo
npm run frontend       # solo Vite dev server (puerto 5173)
npm run backend        # solo NestJS (puerto 3000)
npm run landing        # solo landing dev server (puerto 5174)
npm run db:migrate     # aplicar migraciones Prisma
npm run db:seed        # seed con usuarios iniciales
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

**Features existentes (frontend):** `auth`, `patients`, `medical-records`, `clinical-exams`, `appointments`, `inventory`, `sales`, `users`, `layout`

---

## Landing — Arquitectura (`apps/landing/`)

Portal público de la óptica. Consume la Public API del backend (sin JWT).

**Páginas:**
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `HomePage` | Link-in-bio: logo, categorías, WhatsApp, redes |
| `/catalogo` | `CatalogPage` | Grid paginado con filtros de categoría + búsqueda |
| `/catalogo/:id` | `ProductPage` | Detalle: galería, specs, CTA WhatsApp + reserva |
| `/reservar` | `BookingPage` | Formulario de reserva → `POST /public/bookings` |

**API client:** `src/lib/api.ts` → `publicApi.getCatalog()`, `getProduct()`, `getClinicInfo()`, `createBooking()`

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

**Auth:** JWT Bearer token. Guards: `JwtAuthGuard` (autenticación) + `RolesGuard` (autorización).

**Módulos:** `auth`, `users`, `patients`, `appointments`, `medical-records`, `clinical-exams`, `inventory`, `sales`, `settings`, `upload`, `public`, `prisma` (global).

**Seguridad:** `helmet` (headers HTTP) + `@nestjs/throttler` (10/seg · 100/min · 1000/h global; `POST /public/bookings` con límite propio 2/10s · 3/min). CORS multi-origen via `CORS_ORIGINS` (separados por coma).

**Total endpoints:** 48 — ver `docs/API_ENDPOINTS.md`

---

## Roles y permisos

| Rol | Acceso |
|-----|--------|
| `admin` | Todo — usuarios, configuración, eliminar cualquier cosa |
| `manager` | Ventas, pacientes, inventario, reportes, ver usuarios |
| `optician` | Ventas, pacientes, historiales, citas, exámenes clínicos |

---

## Base de datos — Modelos Prisma

> **Fuente de verdad:** `apps/backend/prisma/schema.prisma`
> La tabla `profiles` en Supabase sirve como tabla de usuarios del backend NestJS.
> Prisma model `User` → tabla `profiles` (via `@@map("profiles")`).
> Enums con guiones en DB se mapean con `@map` en Prisma (ej: `eye_exam @map("eye-exam")`).

| Tabla DB | Modelo Prisma | Descripción |
|----------|---------------|-------------|
| `profiles` | `User` | Usuarios del sistema — auth independiente de Supabase Auth |
| `patients` | `Patient` | Pacientes con seguro y contacto emergencia |
| `patient_insurances` | `PatientInsurance` | Datos de seguro (1:1 con patient) |
| `patient_emergency_contacts` | `PatientEmergencyContact` | Contacto emergencia (1:1 con patient) |
| `appointments` | `Appointment` | Citas con practitioner y slots de 30min |
| `medical_records` | `MedicalRecord` | Historial clínico — columnas planas para refracción, AV, PIO |
| `clinical_exams` | `ClinicalExam` | Examen clínico con PD y medidas de armazón — columnas planas |
| `products` | `Product` | Catálogo de productos del inventario |
| `product_specifications` | `ProductSpecification` | Specs técnicas por categoría (1:1 con product) |
| `product_suppliers` | `ProductSupplier` | Proveedor del producto (1:1 con product) |
| `stock_movements` | `StockMovement` | Entradas/salidas/ajustes de stock |
| `sales` | `Sale` | Ventas con estado y garantía |
| `sale_items` | `SaleItem` | Líneas de venta (snapshot nombre+SKU) |
| `payments` | `Payment` | Pagos individuales (útil para pago mixto) |
| `clinic_settings` | `ClinicSettings` | Configuración de la óptica (singleton) — incluye `businessHours Json?` |
| `public_bookings` | `PublicBooking` | Reservas online del portal público — estado `pending/confirmed/cancelled` |

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
- 9 tags: auth, users, patients, appointments, medical-records, clinical-exams, inventory, sales, settings
- Todos los controllers decorados con `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`
- DTOs principales decorados con `@ApiProperty` + ejemplos reales

---

## Archivos de referencia detallados

| Archivo | Contenido |
|---------|-----------|
| `docs/PROJECT_STRUCTURE.md` | Árbol completo (3 apps), rutas, roles |
| `docs/DATABASE_STRUCTURE.md` | Prisma schema + ERD + mapeos + historial de migraciones |
| `docs/API_ENDPOINTS.md` | 47 endpoints con body/params/respuestas |
| `DECISIONS.md` | Decisiones de arquitectura con razonamiento — leer antes de cambios estructurales |
| `AGENT.md` | Gotchas técnicos y decisiones condensadas |
| `Tools.md` | Tareas completadas por sesión + pendientes actuales |

---

## Usuarios seed (contraseña: 123456)

| Email | Rol |
|-------|-----|
| admin@visionkit.com | admin |
| gerente@visionkit.com | manager |
| optico1@visionkit.com | optician |
| optico2@visionkit.com | optician |
