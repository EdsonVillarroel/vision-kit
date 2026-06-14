# Vision Kit — Deployment a Producción

Guía paso-a-paso para desplegar el monorepo completo. Tiempo estimado primera vez: **~2 horas**.

---

## 0. Pre-requisitos (una sola vez)

- Cuenta en **Supabase** (DB ya existe en proyecto `fobfltxxsudplapdwlfj`)
- Cuenta en **Sentry** (gratuita: 5K eventos/mes) → crear proyecto Node.js
- Cuenta en **Vercel** (gratuita) — para frontend, admin, landing
- Cuenta en **Railway** o **Render** o **Fly.io** — para backend NestJS
- GitHub repo configurado con permisos de Actions: *Settings → Actions → General → "Read and write permissions"*

---

## 1. Hardening de la base de datos (Supabase Dashboard)

1. **Activar PITR** (Point-in-Time Recovery):
   *Database → Backups → Enable Daily Backups + PITR (requiere plan Pro $25/mes)*.
   Sin esto, un `DELETE` mal hecho es pérdida total. **Bloqueante para SaaS real.**

2. **Verificar RLS** en todas las tablas:
   *SQL Editor → pegar contenido de [scripts/verify-rls.sql](../scripts/verify-rls.sql) → Run*.
   Resultado esperado: 0 filas en las primeras 2 queries (todas las tablas con `tenant_id` tienen RLS habilitado).

3. **Backup manual antes del primer deploy:**
   *Database → Backups → Create Manual Backup* (etiqueta: `pre-prod-launch`).

---

## 2. Generar secrets de producción

```bash
./scripts/generate-secrets.sh > /tmp/prod-secrets.env
```

Abre `/tmp/prod-secrets.env`, completa los campos vacíos (`DATABASE_URL`, `SUPABASE_*`, `SENTRY_DSN`, `CORS_ORIGINS`) y úsalo como referencia para los pasos siguientes. **Nunca commitear este archivo.**

`DATABASE_URL` y `DIRECT_URL` se obtienen de Supabase: *Project Settings → Database → Connection string → URI* (usar **Connection pooling 6543** para `DATABASE_URL` y **Session 5432** para `DIRECT_URL`).

---

## 3. Backend — Railway (recomendado)

Railway hace deploy directo desde imagen GHCR sin configuración compleja.

1. *New Project → Deploy from Docker Image* → `ghcr.io/edsonvillarroel/vision-kit-backend:latest`
2. *Variables*: pegar todo el contenido de `/tmp/prod-secrets.env`
3. *Settings → Networking → Generate Domain* → copiar el dominio (ej: `vision-kit-backend-production.up.railway.app`)
4. *Settings → Deploy → Healthcheck path*: `/api/v1/health` (timeout 10s)
5. Esperar a que Railway tire el primer deploy. Verificar en logs que aparezca `Nest application successfully started`.

**Aplicar migraciones de Prisma** (primera vez y en cada cambio de schema):
```bash
railway run --service backend -- npx prisma migrate deploy
```
Alternativa con Supabase CLI: `npx supabase db push` desde local.

---

## 4. Frontend / Admin / Landing — Vercel

**Tres deploys separados** (uno por app), todos del mismo repo de GitHub.

Por cada app (`frontend`, `admin`, `landing`):

1. *Vercel → Add New → Project → Import git repository*
2. **Configure Project**:
   - *Root Directory*: `apps/frontend` (o `apps/admin` / `apps/landing`)
   - *Framework Preset*: `Other` (los `vercel.json` ya tienen toda la config)
3. **Environment Variables**:
   - `VITE_API_URL` = `https://tu-backend.up.railway.app/api/v1` (del paso 3.3)
4. *Deploy*

5. *Settings → Domains*: asignar dominios productivos:
   - `app.tudominio.com` → frontend (panel óptica)
   - `admin.tudominio.com` → admin (platform admin)
   - `vision-2020-hd.tudominio.com` o `tudominio.com` → landing (portal público)

**Después del primer deploy de los 3:** volver a Railway y actualizar `CORS_ORIGINS`:
```
CORS_ORIGINS=https://app.tudominio.com,https://admin.tudominio.com,https://vision-2020-hd.tudominio.com
```

---

## 5. Activar Sentry (5 min)

1. *Sentry → Create Project → Platform: Node.js → Project name: `vision-kit-backend`*
2. Copiar el DSN (formato `https://xxx@oNNN.ingest.sentry.io/NNN`)
3. En Railway: actualizar `SENTRY_DSN` con ese valor → redeploy automático
4. *Test*: en Railway logs, debe aparecer `Sentry → enabled` al boot

Para frontends (opcional, recomendado para producción):
- `npm install --workspace=apps/frontend @sentry/react` y wirear en `main.tsx`. Igual para admin y landing.

---

## 6. Smoke tests post-deploy

Ejecutar todos contra producción:

```bash
# 1. Health endpoint
curl https://tu-backend.up.railway.app/api/v1/health
# Esperado: {"status":"ok","uptimeSeconds":<n>,"timestamp":"...","checks":{"database":{"status":"ok",...}}}

# 2. Login (debe rechazar credencial inválida)
curl -X POST https://tu-backend.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"x@x.com","password":"wrong"}'
# Esperado: {"statusCode":401,...,"requestId":"..."}

# 3. Login real (usar usuario seed)
curl -X POST https://tu-backend.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visionkit.com","password":"123456"}'
# Esperado: {"access_token":"...","user":{...}}  ← y NUNCA debe tener "passwordHash"

# 4. Endpoint protegido sin token
curl https://tu-backend.up.railway.app/api/v1/patients
# Esperado: 401

# 5. Frontend levanta
curl -I https://app.tudominio.com
# Esperado: HTTP/2 200 + headers de seguridad
```

Si algo falla: revisar logs en Railway (formato JSON estructurado, filtrar por `level:50` para errores) y Sentry.

---

## 7. Smoke test crítico — aislamiento multi-tenant

Este test prueba que NUNCA un tenant pueda ver datos de otro. **Ejecutar manualmente antes de invitar al primer cliente real.**

1. Crear un segundo tenant via panel admin (`https://admin.tudominio.com`)
2. Login con super_admin del tenant A → crear un paciente "Paciente A"
3. Login con super_admin del tenant B → `GET /api/v1/patients`
4. **Verificar**: la respuesta NO debe incluir "Paciente A". Si lo incluye → escalación P0, parar el deploy y revisar `tenant-cls.middleware.ts` + `tenant-prisma.service.ts`.

(Esto está cubierto por tests unitarios — ver [`tenant-prisma.service.spec.ts`](../apps/backend/src/tenant/tenant-prisma.service.spec.ts) — pero el test E2E real con dos tokens es la verificación final.)

---

## 8. Después del go-live

| Día 1 | Vigilar |
|---|---|
| Logs en Railway: `level:50` (errores) y latencias p95 | |
| Sentry: alertas de errores no esperados | |
| Supabase: *Database → Logs → Query Performance* | |
| Cancelaciones de clientes (`tenant.status` cambios) | |

| Semana 1 | Operar |
|---|---|
| Configurar **uptime monitoring** (UptimeRobot gratis): ping a `/api/v1/health` cada 5 min | |
| Activar **alertas Sentry**: email cuando un error nuevo aparece | |
| Revisar **costo de DB**: queries lentas, índices faltantes | |
| **Primer backup restore drill**: hacer restore a un proyecto Supabase staging para verificar que PITR funciona | |

| Mes 1 | Mejorar |
|---|---|
| Implementar **refresh tokens** (actualmente JWT 7 días = caducidad larga) | |
| **CSP estricta** en frontend (actualmente solo el default de Vercel) | |
| **Tests E2E** con docker-compose.dev.yml (DB local + dos tenants seed) | |
| **Stripe / MercadoPago** webhooks con verificación de firma | |

---

## Rollback plan

| Problema | Acción inmediata |
|---|---|
| Backend tira 500 en bucle | Railway → Deployments → Rollback al deploy anterior (1 click) |
| DB corrupta | Supabase → Backups → PITR a timestamp pre-incident |
| Frontend bloquea login | Vercel → Deployments → Promote anterior |
| Secrets filtrados | `./scripts/generate-secrets.sh` → actualizar Railway → redeploy + invalidar todos los JWTs activos (rotar `JWT_SECRET` ya hace esto) |
