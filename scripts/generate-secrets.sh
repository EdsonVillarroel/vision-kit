#!/usr/bin/env bash
# ============================================================================
# Vision Kit — Generador de secrets para producción
#
# Genera valores criptográficamente seguros para los secrets requeridos
# por el backend. Imprime el output listo para pegar en el dashboard del
# proveedor (Railway/Render/Fly/Vercel) o en un manager de secrets.
#
# Uso:
#   ./scripts/generate-secrets.sh             # imprime a stdout
#   ./scripts/generate-secrets.sh > prod.env  # guarda a archivo (NUNCA commitear)
# ============================================================================

set -euo pipefail

if ! command -v openssl >/dev/null 2>&1; then
  echo "ERROR: openssl no está instalado." >&2
  exit 1
fi

# 64 bytes base64 (~512 bits efectivos) — longitud recomendada por OWASP para HS256/HS512
gen() { openssl rand -base64 64 | tr -d '\n'; }

cat <<EOF
# ─────────────────────────────────────────────────────────────────────────
# Vision Kit — Production secrets
# Generado: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
#
# IMPORTANTE:
#   - Estos secrets deben ir en el dashboard de tu proveedor de hosting,
#     NUNCA commitearse a git ni dejarse en .env del filesystem productivo.
#   - JWT_SECRET y JWT_PLATFORM_SECRET DEBEN ser distintos.
#   - Si sospechás que un secret se filtró, regenerá AMBOS y redeployá.
# ─────────────────────────────────────────────────────────────────────────

JWT_SECRET="$(gen)"
JWT_PLATFORM_SECRET="$(gen)"

# Pegá tus valores reales:
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SENTRY_DSN=""
CORS_ORIGINS="https://app.tudominio.com,https://admin.tudominio.com"

NODE_ENV="production"
LOG_LEVEL="info"
JWT_EXPIRES_IN="7d"
JWT_PLATFORM_EXPIRES_IN="1d"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACES_SAMPLE_RATE="0.1"
EOF
