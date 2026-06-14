# syntax=docker/dockerfile:1.7
# ============================================================================
# Vision Kit Backend — Dockerfile multi-stage
# Build context esperado: raíz del monorepo (vision-kit/)
# Build:  docker build -f apps/backend/Dockerfile -t vision-kit-backend .
# Run:    docker run --rm -p 3000:3000 --env-file apps/backend/.env vision-kit-backend
#
# Las dependencias usan npm workspaces (hoisted al root node_modules), así que
# el image final mantiene la estructura del monorepo: /app/node_modules y
# /app/apps/backend conviven, y Node resuelve módulos vía cascade.
# ============================================================================

# ── Stage 1: deps ── instala dependencias del workspace ────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# openssl: requerido por Prisma. python3/make/g++: para compilar bindings nativos
# (bcrypt). build-base es alternativa más liviana: solo lo necesario para gyp.
RUN apk add --no-cache openssl python3 make g++

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/landing/package.json ./apps/landing/
COPY apps/admin/package.json ./apps/admin/
# El postinstall de @prisma/client necesita el schema disponible al instalar
COPY apps/backend/prisma ./apps/backend/prisma

RUN npm ci

# ── Stage 2: build ── compila NestJS ───────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY package.json package-lock.json ./
COPY apps/backend ./apps/backend

# Genera el Prisma Client con el schema actual (asegura tipos completos)
RUN cd apps/backend && npx prisma generate

RUN npm run build --workspace=apps/backend

# Prune a producción solo del backend
RUN npm prune --omit=dev --workspace=apps/backend

# ── Stage 3: runtime ── imagen final mínima ─────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache openssl tini wget && \
    addgroup -S nodejs -g 1001 && \
    adduser -S nestjs -u 1001 -G nodejs

ENV NODE_ENV=production
ENV PORT=3000

# Mantenemos la estructura del workspace
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/package.json
# Algunos paquetes pueden quedar locales al backend (no hoisted)
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/node_modules ./apps/backend/node_modules

WORKDIR /app/apps/backend
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# tini = init PID 1 → forwards SIGTERM correctamente para shutdown limpio
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
