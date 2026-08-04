# Vision Kit — Deployment a Producción

Guía paso-a-paso para desplegar el monorepo completo. Tiempo estimado primera vez: **~2 horas**.

---

## 0. Pre-requisitos (una sola vez)

- Cuenta en **Supabase** (DB ya existe en proyecto `fobfltxxsudplapdwlfj`)
- Cuenta en **Sentry** (gratuita: 5K eventos/mes) → crear proyecto Node.js
- Cuenta en **Vercel** (gratuita) — para frontend, admin, landing
- **Render** (free tier, sin tarjeta) — para backend NestJS vía Blueprint `render.yaml` (ver sección 3). Alternativas: Cloud Run / Railway / Fly.io
- **Firebase / Google** (proyecto `vision2020-8df81`) — para hosting de los 3 frontends
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

## 3. Backend — Render (recomendado)

**Free tier sin tarjeta de crédito**, sostenible indefinidamente. Ideal para etapa temprana. Construye `apps/backend/Dockerfile` directo desde GitHub (no requiere GHCR ni CLI). Config declarativa en `render.yaml` (Blueprint) en la raíz del repo.

> **Trade-off del free tier:** el servicio se duerme tras 15 min de inactividad → la primera request después tarda ~50s (cold start). Aceptable para uso interno/bajo tráfico. Al crecer, se mueve a un plan pago o a otra plataforma sin tocar el código.

### 3.1 Las dos URLs de Supabase (crítico)
En Supabase → *Project Settings → Database → Connection string*:
- **Transaction pooler** (puerto `6543`, `?pgbouncer=true`) → `DATABASE_URL` (runtime).
- **Direct connection** (puerto `5432`) → `DIRECT_URL` (solo migraciones).

Prisma usa ambas: `url = env("DATABASE_URL")` + `directUrl = env("DIRECT_URL")` en `schema.prisma`.

### 3.2 Secretos JWT
```bash
bash scripts/generate-secrets.sh   # genera JWT_SECRET + JWT_PLATFORM_SECRET (deben ser distintos)
```
Guardar ambos + las 2 URLs Supabase en `env.yaml` local (gitignored) como vault de referencia.

### 3.3 Deploy vía Blueprint
1. Push del repo a GitHub (con `render.yaml` en la raíz).
2. [Render Dashboard](https://dashboard.render.com) → *New → Blueprint* → conectar el repo.
3. Render lee `render.yaml` y crea el servicio `vision-kit-backend`. Pedirá los 4 valores marcados `sync: false` (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_PLATFORM_SECRET`) — pegarlos desde `env.yaml`.
4. *Apply* → primer build+deploy (~3-5 min). El healthcheck `/api/v1/health` debe pasar.

Render inyecta `PORT` automáticamente; el backend lo lee con `process.env.PORT` y bindea a `0.0.0.0`. La URL pública queda: `https://vision-kit-backend.onrender.com` → esa `+ /api/v1` es el `VITE_API_URL` de los frontends.

### 3.4 Migraciones de Prisma (primera vez y en cada cambio de schema)
```bash
cd apps/backend
DATABASE_URL="<direct-url-5432>" npx prisma migrate deploy
```

### 3.5 Redeploy
`autoDeploy: true` en `render.yaml` → cada push a la rama conectada dispara un redeploy automático.

---

## 3-bis. Backend — Cloud Run (alternativa)

Requiere **cuenta de facturación (tarjeta)** aunque el free tier permanente (2M req/mes) no cobre dentro de límites. Mismo proyecto GCP que Firebase (`vision2020-8df81`), escala a cero. Despliega la imagen que publica el CI en GHCR.

### 3.1 Prerrequisitos (una vez)
```bash
# gcloud CLI: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project vision2020-8df81          # MISMO project de Firebase Hosting
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```
> Si el paquete GHCR es privado: GitHub → repo → *Packages → vision-kit-backend → Package settings → Change visibility → Public*. La imagen no contiene secretos.

### 3.2 Las dos URLs de Supabase (crítico con escala a cero)
En Supabase → *Project Settings → Database → Connection string*:
- **Transaction pooler** (puerto `6543`, `?pgbouncer=true`) → `DATABASE_URL` (runtime). Evita agotar conexiones cuando Cloud Run crea instancias nuevas.
- **Direct connection** (puerto `5432`) → `DIRECT_URL` (solo migraciones).

Prisma usa ambas: `url = env("DATABASE_URL")` + `directUrl = env("DIRECT_URL")` en `schema.prisma`.

### 3.3 Variables de entorno (`env.yaml`)
`--set-env-vars` choca con las comas de `CORS_ORIGINS`; usar un archivo es más limpio. Crear `env.yaml` (NO commitear — contiene secretos):
```yaml
NODE_ENV: production
DATABASE_URL: postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL: postgresql://...@...supabase.com:5432/postgres
JWT_SECRET: <scripts/generate-secrets.sh>
JWT_PLATFORM_SECRET: <scripts/generate-secrets.sh>
CORS_ORIGINS: https://vision-kit.web.app,https://vision-2020-hd.web.app,https://vision-kit-admin.web.app
# opcionales: SENTRY_DSN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LOG_LEVEL
```

### 3.4 Deploy
```bash
gcloud run deploy vision-kit-backend \
  --image ghcr.io/edsonvillarroel/vision-kit-backend:latest \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --min-instances 0 \
  --env-vars-file env.yaml
```
El backend escucha en `process.env.PORT` (`main.ts`), que Cloud Run inyecta automáticamente. Al terminar imprime la URL: `https://vision-kit-backend-xxxx.a.run.app` → esa `+ /api/v1` es el `VITE_API_URL` de los 3 frontends.

### 3.5 Migraciones de Prisma (primera vez y en cada cambio de schema)
```bash
cd apps/backend
DATABASE_URL="<direct-url-5432>" npx prisma migrate deploy
```

### 3.6 Redeploy tras nueva imagen
El CI publica `latest` en cada push a `main`. Para forzar que Cloud Run tome la nueva imagen:
```bash
gcloud run deploy vision-kit-backend --image ghcr.io/edsonvillarroel/vision-kit-backend:latest --region southamerica-east1
```

---

## 3-ter. Backend — Railway (alternativa)

Railway hace deploy directo desde imagen GHCR sin configuración compleja. Sin capa gratuita (~$5/mes); útil si prefieres cero CLI.

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
