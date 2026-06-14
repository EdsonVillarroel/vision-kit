-- ============================================================================
-- Vision Kit — Auditoría de Row-Level Security
--
-- Reporta cualquier tabla en el schema `public` que NO tenga RLS habilitado.
-- En SaaS multi-tenant, RLS es la última línea de defensa: si un bug en el
-- backend permite una query sin tenantId, RLS bloqueará el acceso a nivel DB.
--
-- Uso (Supabase SQL Editor o psql):
--   psql $DATABASE_URL -f scripts/verify-rls.sql
--
-- Resultado esperado: TODAS las tablas con tenant_id deben mostrar
-- relrowsecurity = true. Cualquier `false` es un agujero de seguridad.
-- ============================================================================

-- ── 1. Tablas SIN RLS habilitado ──────────────────────────────────────────
SELECT
  '⚠️  RLS DESHABILITADO' AS issue,
  schemaname,
  tablename,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = schemaname
        AND c.table_name = tablename
        AND c.column_name = 'tenant_id'
    ) THEN '🔴 TIENE tenant_id — RIESGO ALTO de fuga cross-tenant'
    ELSE '🟡 sin tenant_id — verificar si RLS aplica'
  END AS severity
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = t.schemaname
)
WHERE t.schemaname = 'public'
  AND COALESCE(c.relrowsecurity, false) = false
ORDER BY tablename;

-- ── 2. Tablas CON RLS pero SIN policies (RLS sin policy = bloqueo total) ──
SELECT
  '⚠️  RLS sin policies' AS issue,
  schemaname,
  tablename,
  'sin policies — tabla queda inaccesible salvo para superuser' AS note
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename
  )
ORDER BY tablename;

-- ── 3. Resumen: estado RLS de cada tabla del schema público ────────────────
SELECT
  t.tablename,
  c.relrowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policies,
  EXISTS (
    SELECT 1
    FROM information_schema.columns col
    WHERE col.table_schema = 'public'
      AND col.table_name = t.tablename
      AND col.column_name = 'tenant_id'
  ) AS has_tenant_id
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, c.relrowsecurity
ORDER BY rls_enabled ASC, has_tenant_id DESC, t.tablename;
