-- ─────────────────────────────────────────────────────────────────────────────
-- Migración 015: Row-Level Security (RLS) — aislamiento por tenant
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTA: El backend NestJS usa la clave `service_role` vía DATABASE_URL, que
-- bypasses RLS por diseño de Supabase. Estas políticas protegen el acceso
-- directo a la DB (Prisma Studio, clientes anon, migraciones manuales).
-- El aislamiento real en el backend se garantiza con TenantPrismaService.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Habilitar RLS en todas las tablas de negocio con tenant_id ────────────────

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurances   ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_exams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_suppliers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales                ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_bookings      ENABLE ROW LEVEL SECURITY;

-- ── Políticas para service_role (bypass total — Prisma usa esta clave) ─────────
-- service_role ya bypasses RLS nativamente en Supabase; estas políticas son
-- explícitas para documentar el intento y cubrir edge cases.

CREATE POLICY "service_role_all" ON profiles
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON patients
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON patient_insurances
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON patient_emergency_contacts
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON appointments
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON medical_records
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON clinical_exams
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON products
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON product_specifications
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON product_suppliers
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON stock_movements
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON sales
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON sale_items
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON payments
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON clinic_settings
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON public_bookings
  TO service_role USING (true) WITH CHECK (true);

-- ── Tablas de plataforma (sin tenant_id) — solo service_role ─────────────────

ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON tenants
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON subscription_plans
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON subscriptions
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON platform_admins
  TO service_role USING (true) WITH CHECK (true);
