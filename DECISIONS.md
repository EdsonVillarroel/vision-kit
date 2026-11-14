# Vision Kit — Decisiones de arquitectura

> **Propósito:** Registro de decisiones arquitectónicas no obvias con su justificación.
> Evita que se revierta trabajo ya pensado o se repitan debates resueltos. Cada entrada
> documenta qué se decidió, por qué y qué alternativas se descartaron.
>
> **Etapa de lectura:** Leer obligatoriamente antes de proponer cambios estructurales
> en auth, base de datos, arquitectura de módulos o patrones globales del sistema.

---

## Autenticación

| Decisión | Razón | ¿Revisable? |
|----------|-------|-------------|
| NestJS gestiona su propio JWT con `passwordHash` en `profiles` | Elimina dependencia de Supabase Auth en el flujo backend. Ambos sistemas (NestJS y Supabase Auth) coexisten sin interferirse | Solo si se migra completamente a Supabase Auth |
| JWT duración 7 días sin refresh token | Decisión de MVP para uso interno (no es app pública). Suficiente para el flujo de trabajo de la óptica | Sí — pendiente para producción |
| Sin FK de `profiles.id` → `auth.users` | Hace el backend completamente independiente de Supabase Auth. El staff del sistema no necesita cuenta en Supabase Auth | No cambiar salvo migración a Supabase Auth |

---

## Base de datos

| Decisión | Razón | ¿Revisable? |
|----------|-------|-------------|
| Supabase CLI para migraciones (no `prisma migrate dev`) | Supabase tiene RLS, policies y triggers que `prisma migrate` no entiende ni preserva. El DDL debe ser SQL manual con control total | No — esta es la convención permanente |
| Columnas planas en `medical_records` y `clinical_exams` | Mejor type safety en Prisma que JSONB. Las 20+ columnas de refracción/AV/PIO se consultan individualmente | No cambiar salvo rediseño del dominio médico |
| `directUrl` en Prisma datasource | PgBouncer (pooling) no soporta transacciones de migración. `directUrl` bypasea el pooler solo para migraciones, mientras `DATABASE_URL` sigue usando pooling para queries | No — arquitectura requerida por Supabase |
| `PublicBooking` separado de `Appointment` | Las reservas públicas son anónimas (sin FK a Patient/User). El staff las revisa y convierte manualmente en citas reales del sistema | Sí si se automatiza el flujo de conversión |
| Lentes y materiales como categoría `lens_options` de `products` (no tabla propia) | Son líneas de venta: reutilizar `Product` mantiene `sale_items.product_id`, comisiones y métricas sin cambios ni endpoints nuevos. No tienen stock (se fabrican a pedido), por eso se excluyen de listados, cuotas y catálogo público. El grupo vive en `specifications.lensType` | Sí si necesitan compatibilidades o precios por rango de graduación |
| `serviceType` en `PublicBooking` es `String` libre | El público escribe texto legible. El staff mapea al enum interno al confirmar la cita. Evita confusión con terminología técnica en el portal público | Sí si se agrega un selector en el portal |

---

## Arquitectura del monorepo

| Decisión | Razón | ¿Revisable? |
|----------|-------|-------------|
| Landing como workspace en monorepo (no repo separado) | CI/CD compartido, variables de entorno coherentes, un solo `npm install` | Solo si la landing escala a algo más grande |
| Feature-based modular en frontend (no por tipo de archivo) | Cada feature es autocontenida (hooks + services + types + components). Facilita agregar/eliminar features sin tocar otras | No — convención establecida |
| Nunca exponer `passwordHash`, `taxRate`, `rfc`, `costPrice` | Seguridad básica. Los primeros tres son datos sensibles del negocio/auth, `costPrice` es información comercial interna | No cambiar |

---

## Seguridad

| Decisión | Razón |
|----------|-------|
| Throttle estricto en `POST /public/bookings` (2/10s · 3/min) | Es el único endpoint público de escritura. Sin throttle es vulnerable a spam de reservas falsas |
| `service_role` key solo en backend para Storage | La `service_role` key bypasea RLS. Solo el backend puede usarla. El frontend usa URLs firmadas o públicas según el bucket |
| CORS multi-origen via `CORS_ORIGINS` (env) | Panel interno + landing corren en dominios distintos en producción. La lista de orígenes está en variables de entorno, no hardcoded |
| `super_admin` pasa cualquier `@Roles` en `RolesGuard` | Es el dueño del tenant ("todo dentro del tenant"). Listarlo en cada decorador era fácil de olvidar y lo dejaba sin poder borrar/ajustar stock. El aislamiento entre tenants lo da `TenantPrismaService`, no los roles. |
| Reset de contraseña por admin, sin email | No hay infraestructura de correo. `PATCH /users/:id/reset-password` (admin/super_admin) no pide la actual; prohíbe la propia cuenta (va por `/password`) y que un admin tome la cuenta del super_admin. |
| Contraseña en texto plano dentro de HTTPS | Estándar: TLS cifra el transporte y el backend guarda bcrypt. Hashear en el navegador no agrega seguridad (el hash pasa a ser la contraseña). La defensa real es límite de intentos en login + `trust proxy` correcto + logs con `password` redactado. |
| Configs de agentes/IDE revisadas como código | El commit `a2a8cb7` (18/04/2026) metió un loader de malware ejecutado por hooks `SessionStart` (Claude/Gemini), una regla de Cursor, una tarea VS Code `folderOpen` y `npm test`. Eliminado en `security/remove-malware`. Checklist en la plantilla de PR. |
