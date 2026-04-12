-- ============================================================
-- Migration 012: Multi-Tenant Foundation
-- Adds tenant tables, subscription management, platform admins,
-- and tenant_id to all existing business tables (nullable).
-- ============================================================

-- ─────────────────────────────────────────
-- NEW ENUMS
-- ─────────────────────────────────────────

CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'cancelled');
CREATE TYPE billing_period AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trial');
CREATE TYPE platform_admin_status AS ENUM ('active', 'inactive');

-- ─────────────────────────────────────────
-- NEW TABLES
-- ─────────────────────────────────────────

-- Tenants (each optical clinic is a tenant)
CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  primary_color   TEXT NOT NULL DEFAULT '#6366f1',
  secondary_color TEXT NOT NULL DEFAULT '#4f46e5',
  accent_color    TEXT NOT NULL DEFAULT '#818cf8',
  domain          TEXT,
  status          tenant_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_slug ON tenants (slug);
CREATE INDEX idx_tenants_status ON tenants (status);

-- Subscription plans
CREATE TABLE subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'BOB',
  billing_period  billing_period NOT NULL DEFAULT 'monthly',
  max_users       INT NOT NULL,
  max_patients    INT NOT NULL,
  max_products    INT NOT NULL,
  max_storage_mb  INT NOT NULL,
  features        JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions (tenant ↔ plan)
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id         UUID NOT NULL REFERENCES subscription_plans(id),
  status          subscription_status NOT NULL DEFAULT 'active',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  payment_notes   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_tenant_id ON subscriptions (tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- Platform admins (separate from tenant users)
CREATE TABLE platform_admins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  status          platform_admin_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- ADD super_admin TO user_role ENUM
-- ─────────────────────────────────────────

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin' BEFORE 'admin';

-- ─────────────────────────────────────────
-- ADD tenant_id (NULLABLE) TO ALL BUSINESS TABLES
-- Session 2 will backfill and make NOT NULL.
-- ─────────────────────────────────────────

-- profiles (users)
ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_profiles_tenant_id ON profiles (tenant_id);

-- patients
ALTER TABLE patients ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_patients_tenant_id ON patients (tenant_id);

-- appointments
ALTER TABLE appointments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_appointments_tenant_id ON appointments (tenant_id);

-- medical_records
ALTER TABLE medical_records ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_medical_records_tenant_id ON medical_records (tenant_id);

-- clinical_exams
ALTER TABLE clinical_exams ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_clinical_exams_tenant_id ON clinical_exams (tenant_id);

-- products
ALTER TABLE products ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_products_tenant_id ON products (tenant_id);

-- stock_movements
ALTER TABLE stock_movements ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_stock_movements_tenant_id ON stock_movements (tenant_id);

-- sales
ALTER TABLE sales ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_sales_tenant_id ON sales (tenant_id);

-- sale_items
ALTER TABLE sale_items ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_sale_items_tenant_id ON sale_items (tenant_id);

-- payments
ALTER TABLE payments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_payments_tenant_id ON payments (tenant_id);

-- clinic_settings
ALTER TABLE clinic_settings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_clinic_settings_tenant_id ON clinic_settings (tenant_id);

-- public_bookings
ALTER TABLE public_bookings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_public_bookings_tenant_id ON public_bookings (tenant_id);
