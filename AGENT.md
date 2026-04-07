# Vision Kit — AGENT.md

> **Propósito:** Gotchas técnicos, decisiones condensadas y trampas conocidas del proyecto.
> Contiene solo lo que no se puede deducir del código ni del `git log`: comportamientos
> inesperados, configuraciones críticas y el historial de migraciones SQL aplicadas.
>
> **Etapa de lectura:** Consultar al depurar errores difíciles de rastrear, antes de tocar
> configuración de auth/DB, o cuando algo no funciona como se esperaría por la documentación.

---

## Decisiones de arquitectura

> Ver también `DECISIONS.md` para el razonamiento completo.

| Decisión | Razón resumida |
|----------|----------------|
| `profiles` tabla para auth NestJS (sin FK a `auth.users`) | Backend independiente de Supabase Auth; coexisten sin interferirse |
| Columnas planas en `medical_records`/`clinical_exams` | Type safety en Prisma > JSONB; queries más eficientes |
| Supabase CLI para migraciones, no `prisma migrate dev` | Preserva RLS, policies y triggers |
| `directUrl` en Prisma datasource | PgBouncer no soporta migraciones; `directUrl` bypasea el pooler |
| `PublicBooking` separado de `Appointment` | Reservas anónimas sin FK; staff convierte manualmente en citas |
| JWT 7 días sin refresh token | Decisión MVP para uso interno — pendiente para producción |

---

## Gotchas técnicos

| Problema | Solución |
|----------|---------|
| `npx prisma generate` instala Prisma 7 (breaking changes) | Usar `./node_modules/.bin/prisma generate --schema=apps/backend/prisma/schema.prisma` |
| Enums en DB con guiones (`eye-exam`, `in-progress`) | Mapeados con `@map("eye-exam")` en el schema Prisma |
| `profiles.status` era `text` con check constraint, no enum | Migración 007 creó enum `user_status` y alteró la columna |
| `appointments.patient_name` era NOT NULL, bloqueaba seed | Migración 008 lo marcó nullable |
| PgBouncer no soporta `ON CONFLICT` en transacciones Prisma | Usar `$executeRawUnsafe` con SQL puro en seed |
| Supabase Storage: `service_role` key bypasea RLS | Solo usar en backend (NestJS upload service), nunca exponer al frontend |

---

## Historial de migraciones Supabase

| N° | Nombre | Cambio principal |
|----|--------|-----------------|
| 001 | `create_profiles_and_patients` | Tabla profiles, patients, enums base |
| 002 | `create_inventory` | products, stock_movements |
| 003 | `create_appointments_and_records` | appointments, medical_records, clinical_exams |
| 004 | `create_sales` | sales, sale_items, payments |
| 005 | `rls_policies` | RLS en todas las tablas + Storage buckets |
| 006 | `align_with_prisma` | Columnas planas, tablas normalizadas, passwordHash |
| 007 | `fix_enum_types` | Enum user_status, altera profiles.status |
| 008 | `fix_appointments_nullable` | patient_name nullable en appointments |
| 009 | `sale_cancellation_reason` | cancellation_reason en sales |
| 010 | `add_business_hours` | business_hours JSONB en clinic_settings |
| 011 | `public_bookings` | Tabla public_bookings + RLS + trigger |
