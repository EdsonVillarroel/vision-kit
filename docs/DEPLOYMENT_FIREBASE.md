# Vision Kit — Deploy MVP a Firebase + Cloud Run

Arquitectura del MVP:

```
Firebase Hosting (multi-site, 1 proyecto)        Cloud Run            Supabase
├── frontend  (panel óptica)   ──┐
├── landing   (portal público)  ─┼─ VITE_API_URL ─► backend NestJS ──► PostgreSQL
└── admin     (platform admin)  ─┘                  (Docker/GHCR)
```

> ⚠️ Cloud Run y el multi-site hosting requieren el plan **Blaze** (pay-as-you-go) de Firebase.
> Para un MVP el costo real es ~$0–5/mes (escala a cero). Necesitas billing habilitado en GCP.

---

## 0. Pre-requisitos (una vez)

```bash
# Instalar CLIs
npm install -g firebase-tools
curl https://sdk.cloud.google.com | bash && exec -l $SHELL   # gcloud

firebase login
gcloud auth login
```

---

## 1. Crear el proyecto Firebase/GCP

```bash
# Crear proyecto (el ID es global y único)
firebase projects:create vision-kit-prod --display-name "Vision Kit"

# Vincular billing (necesario para Cloud Run). Lista tus cuentas:
gcloud billing accounts list
gcloud billing projects link vision-kit-prod --billing-account=XXXXXX-XXXXXX-XXXXXX
```

Reemplaza en [.firebaserc](../.firebaserc) los 4 placeholders:
- `REEMPLAZAR_PROJECT_ID` → `vision-kit-prod` (en los 2 lugares)
- `REEMPLAZAR_SITE_FRONTEND` / `_LANDING` / `_ADMIN` → ver paso 2.

---

## 2. Crear los 3 sitios de Hosting y enlazar targets

```bash
# El site ID es global y único — ajusta si están tomados
firebase hosting:sites:create vision-kit-app     --project vision-kit-prod
firebase hosting:sites:create vision-kit-landing --project vision-kit-prod
firebase hosting:sites:create vision-kit-admin   --project vision-kit-prod

# Enlazar cada target de firebase.json a su site (escribe en .firebaserc)
firebase target:apply hosting frontend vision-kit-app     --project vision-kit-prod
firebase target:apply hosting landing  vision-kit-landing --project vision-kit-prod
firebase target:apply hosting admin    vision-kit-admin   --project vision-kit-prod
```

URLs resultantes: `https://vision-kit-app.web.app`, `...-landing.web.app`, `...-admin.web.app`.

---

## 3. Desplegar el backend a Cloud Run

Ya tienes [apps/backend/Dockerfile](../apps/backend/Dockerfile). Build context = raíz del monorepo.

```bash
gcloud config set project vision-kit-prod
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Build + push + deploy en un paso (desde la raíz del repo)
gcloud run deploy vision-kit-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "JWT_SECRET=...,JWT_PLATFORM_SECRET=...,DATABASE_URL=...,DIRECT_URL=...,CORS_ORIGINS=https://vision-kit-app.web.app,https://vision-kit-landing.web.app,https://vision-kit-admin.web.app"
```

> Genera los secrets con `./scripts/generate-secrets.sh`. `DATABASE_URL`/`DIRECT_URL` salen de
> Supabase (pooling 6543 / session 5432). Si tu Dockerfile espera el build desde GHCR en vez de
> `--source .`, usa `--image ghcr.io/edsonvillarroel/vision-kit-backend:latest`.

Al terminar, copia la **Service URL** (ej. `https://vision-kit-backend-xxxx.run.app`).
Verifica: `curl https://...run.app/api/v1/health` → debe responder `ok`.

---

## 4. Apuntar los frontends al backend

En cada app, copia el ejemplo y completa la URL de Cloud Run + `/api/v1`:

```bash
for app in frontend landing admin; do
  cp apps/$app/.env.production.example apps/$app/.env.production
done
# Edita cada apps/*/.env.production:
# VITE_API_URL=https://vision-kit-backend-xxxx.run.app/api/v1
```

(Estos `.env.production` están gitignored — no se commitean.)

---

## 5. Build + deploy de los 3 frontends

```bash
npm run deploy:hosting     # build de los 3 + firebase deploy --only hosting
```

O individualmente: `npm run deploy:frontend`, `deploy:landing`, `deploy:admin`.

---

## 6. Smoke test

1. `https://vision-kit-app.web.app` → login con `admin@visionkit.com` / `123456`.
2. `https://vision-kit-admin.web.app` → login con `platform@visionkit.com`.
3. `https://vision-kit-landing.web.app/vision-2020-hd` → portal público.
4. Verifica que no haya errores CORS en la consola (si los hay, revisa `CORS_ORIGINS` del backend).

---

## Notas

- **CORS:** el backend usa `CORS_ORIGINS` (separado por comas). Debe incluir los 3 dominios `.web.app`.
- **Dominio propio:** Firebase Hosting → Add custom domain por cada site cuando lo tengas.
- **CI/CD opcional:** `firebase init hosting:github` añade deploy automático en cada push a `main`.
- **Alternativa sin CORS:** en vez de `VITE_API_URL` absoluto, podrías hacer rewrite `/api/**` →
  Cloud Run en el `firebase.json` del frontend. Para el MVP, la URL directa es más simple.
