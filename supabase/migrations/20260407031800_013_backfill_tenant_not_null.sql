-- ============================================================
-- Migration 013: Backfill tenant_id, enforce NOT NULL,
-- tenant-scoped unique constraints, seed default data.
-- ============================================================

-- ─────────────────────────────────────────
-- 1. INSERT DEFAULT TENANT (Visión 20/20 HD)
-- ─────────────────────────────────────────

INSERT INTO tenants (id, name, slug, logo_url, primary_color, secondary_color, accent_color, status)
VALUES (
  '00000000-0000-4000-a000-000000000001',
  'Visión 20/20 HD',
  'vision-2020-hd',
  NULL,
  '#c17d2a',
  '#4f46e5',
  '#818cf8',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- 2. INSERT SUBSCRIPTION PLANS
-- ─────────────────────────────────────────

INSERT INTO subscription_plans (id, name, slug, price, currency, billing_period, max_users, max_patients, max_products, max_storage_mb, features, is_active, sort_order)
VALUES
  (
    '00000000-0000-4000-b000-000000000001',
    'Básico',
    'basico',
    150.00,
    'BOB',
    'monthly',
    3,
    500,
    200,
    512,
    '{"appointments": true, "inventory": true, "sales": true, "medicalRecords": false, "clinicalExams": false, "publicPortal": false}',
    true,
    1
  ),
  (
    '00000000-0000-4000-b000-000000000002',
    'Profesional',
    'profesional',
    350.00,
    'BOB',
    'monthly',
    10,
    2000,
    1000,
    2048,
    '{"appointments": true, "inventory": true, "sales": true, "medicalRecords": true, "clinicalExams": true, "publicPortal": true}',
    true,
    2
  ),
  (
    '00000000-0000-4000-b000-000000000003',
    'Empresarial',
    'empresarial',
    700.00,
    'BOB',
    'monthly',
    50,
    10000,
    5000,
    10240,
    '{"appointments": true, "inventory": true, "sales": true, "medicalRecords": true, "clinicalExams": true, "publicPortal": true, "multiLocation": true, "apiAccess": true}',
    true,
    3
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- 3. CREATE SUBSCRIPTION FOR DEFAULT TENANT (Profesional)
-- ─────────────────────────────────────────

INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at)
VALUES (
  '00000000-0000-4000-c000-000000000001',
  '00000000-0000-4000-a000-000000000001',
  '00000000-0000-4000-b000-000000000002',
  'active',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- 4. INSERT DEFAULT PLATFORM ADMIN
-- ─────────────────────────────────────────
-- Password: 123456 (bcrypt hash)

INSERT INTO platform_admins (id, email, password_hash, name, status)
VALUES (
  '00000000-0000-4000-d000-000000000001',
  'platform@visionkit.com',
  '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
  'Platform Admin',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- 5. BACKFILL tenant_id ON ALL BUSINESS TABLES
-- ─────────────────────────────────────────

UPDATE profiles         SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE patients         SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE appointments     SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE medical_records  SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE clinical_exams   SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE products         SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE stock_movements  SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE sales            SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE sale_items       SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE payments         SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE clinic_settings  SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;
UPDATE public_bookings  SET tenant_id = '00000000-0000-4000-a000-000000000001' WHERE tenant_id IS NULL;

-- ─────────────────────────────────────────
-- 6. MAKE tenant_id NOT NULL ON ALL TABLES
-- ─────────────────────────────────────────

ALTER TABLE profiles        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE patients        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE appointments    ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE medical_records ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE clinical_exams  ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE products        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE sales           ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE sale_items      ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE payments        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE clinic_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public_bookings ALTER COLUMN tenant_id SET NOT NULL;

-- ─────────────────────────────────────────
-- 7. REPLACE GLOBAL UNIQUE CONSTRAINTS WITH TENANT-SCOPED
-- ─────────────────────────────────────────

-- patients.identification_id: unique per tenant (not globally)
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_identification_id_key;
CREATE UNIQUE INDEX uq_patients_tenant_identification ON patients (tenant_id, identification_id);

-- products.sku: unique per tenant
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;
CREATE UNIQUE INDEX uq_products_tenant_sku ON products (tenant_id, sku);

-- appointments.appointment_number: unique per tenant
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_appointment_number_key;
CREATE UNIQUE INDEX uq_appointments_tenant_number ON appointments (tenant_id, appointment_number);

-- clinical_exams.exam_number: unique per tenant
ALTER TABLE clinical_exams DROP CONSTRAINT IF EXISTS clinical_exams_exam_number_key;
CREATE UNIQUE INDEX uq_clinical_exams_tenant_number ON clinical_exams (tenant_id, exam_number);

-- sales.sale_number: unique per tenant
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_sale_number_key;
CREATE UNIQUE INDEX uq_sales_tenant_number ON sales (tenant_id, sale_number);

-- clinic_settings: one per tenant
CREATE UNIQUE INDEX uq_clinic_settings_tenant ON clinic_settings (tenant_id);

-- ─────────────────────────────────────────
-- 8. SET DEFAULT tenant_id FOR NEW ROWS (convenience for seed/dev)
-- ─────────────────────────────────────────
-- These defaults will be removed when provisioning handles tenant creation.

ALTER TABLE profiles        ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE patients        ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE appointments    ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE medical_records ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE clinical_exams  ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE products        ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE stock_movements ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE sales           ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE sale_items      ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE payments        ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE clinic_settings ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
ALTER TABLE public_bookings ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-4000-a000-000000000001';
