#!/usr/bin/env bash
# Deja lista una base Postgres VACÍA para las pruebas E2E: schema + tenant + seed + suscripción.
# Uso: E2E_DATABASE_URL=postgresql://... npm run db:prepare --workspace=e2e
# ¡Nunca apuntar a Supabase/producción! Borra y recrea el schema.
set -euo pipefail

: "${E2E_DATABASE_URL:?Definí E2E_DATABASE_URL (base de prueba, NO producción)}"
case "$E2E_DATABASE_URL" in
  *supabase*|*pooler*) echo "E2E_DATABASE_URL parece producción (Supabase). Abortado." >&2; exit 1 ;;
esac

HERE="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$HERE/../../apps/backend"
export DATABASE_URL="$E2E_DATABASE_URL" DIRECT_URL="$E2E_DATABASE_URL"

cd "$BACKEND"
npx prisma db push --force-reset --skip-generate --accept-data-loss
psql "$E2E_DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$HERE/bootstrap.sql"
npx ts-node prisma/seedPlans.ts
npx ts-node prisma/seed.ts
psql "$E2E_DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$HERE/after-seed.sql"
echo "✅ Base E2E lista"
