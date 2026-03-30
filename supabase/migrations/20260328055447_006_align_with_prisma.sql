-- ============================================================
-- 006: Align Supabase DB with Prisma Schema (NestJS API)
-- ============================================================
-- Fixes:
--  1. profiles: remove auth.users FK + add password_hash
--  2. patient_insurances + patient_emergency_contacts tables
--  3. product_specifications + product_suppliers tables
--  4. medical_records: JSONB → flat columns
--  5. clinical_exams: JSONB → flat columns
--  6. product_status enum: add in_stock / low_stock / discontinued
--  7. appointments: add cancellation_reason
--  8. sales: add prescription_required, warranty_expiry_date, warranty_terms
--  9. stock_movements: fix date type
-- 10. clinic_settings table
-- ============================================================

-- ============================================================
-- 1. PROFILES: remove auth.users FK, add password_hash
-- ============================================================

-- Drop trigger that auto-creates profile (NestJS manages its own users)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop FK constraint so NestJS can insert without auth.users entry
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

-- Change id to be self-managed (no longer references auth.users)
alter table public.profiles
  alter column id set default gen_random_uuid();

-- Add password_hash for NestJS JWT auth
alter table public.profiles
  add column if not exists password_hash text;

-- ============================================================
-- 2. PATIENT_INSURANCES table
-- ============================================================

create table if not exists public.patient_insurances (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null unique references public.patients(id) on delete cascade,
  provider     text not null,
  policy_number text not null,
  group_number text
);

-- ============================================================
-- 3. PATIENT_EMERGENCY_CONTACTS table
-- ============================================================

create table if not exists public.patient_emergency_contacts (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null unique references public.patients(id) on delete cascade,
  name         text not null,
  relationship text not null,
  phone        text not null
);

-- ============================================================
-- 4. MEDICAL RECORDS: JSONB → flat columns
-- ============================================================

-- Drop JSONB columns
alter table public.medical_records
  drop column if exists visual_acuity,
  drop column if exists refraction,
  drop column if exists prescription,
  drop column if exists eye_health,
  drop column if exists iop_unit;

-- Change IOP columns from numeric to integer
alter table public.medical_records
  alter column iop_right type integer using iop_right::integer,
  alter column iop_left  type integer using iop_left::integer;

-- Add VA (Visual Acuity) flat columns
alter table public.medical_records
  add column if not exists va_right_uncorrected  text,
  add column if not exists va_right_corrected    text,
  add column if not exists va_left_uncorrected   text,
  add column if not exists va_left_corrected     text;

-- Add Refraction flat columns
alter table public.medical_records
  add column if not exists refraction_right_sphere    numeric(5,2),
  add column if not exists refraction_right_cylinder  numeric(5,2),
  add column if not exists refraction_right_axis      integer,
  add column if not exists refraction_right_add       numeric(5,2),
  add column if not exists refraction_right_prism     numeric(5,2),
  add column if not exists refraction_right_base      text,
  add column if not exists refraction_right_pd        numeric(4,1),
  add column if not exists refraction_left_sphere     numeric(5,2),
  add column if not exists refraction_left_cylinder   numeric(5,2),
  add column if not exists refraction_left_axis       integer,
  add column if not exists refraction_left_add        numeric(5,2),
  add column if not exists refraction_left_prism      numeric(5,2),
  add column if not exists refraction_left_base       text,
  add column if not exists refraction_left_pd         numeric(4,1);

-- Add Prescription flat columns
alter table public.medical_records
  add column if not exists prescription_right_sphere    numeric(5,2),
  add column if not exists prescription_right_cylinder  numeric(5,2),
  add column if not exists prescription_right_axis      integer,
  add column if not exists prescription_right_add       numeric(5,2),
  add column if not exists prescription_right_pd        numeric(4,1),
  add column if not exists prescription_left_sphere     numeric(5,2),
  add column if not exists prescription_left_cylinder   numeric(5,2),
  add column if not exists prescription_left_axis       integer,
  add column if not exists prescription_left_add        numeric(5,2),
  add column if not exists prescription_left_pd         numeric(4,1),
  add column if not exists prescription_frame_type      text,
  add column if not exists prescription_lens_type       text;

-- Add Eye Health flat columns
alter table public.medical_records
  add column if not exists eye_health_right_anterior   text,
  add column if not exists eye_health_right_posterior  text,
  add column if not exists eye_health_right_notes      text,
  add column if not exists eye_health_left_anterior    text,
  add column if not exists eye_health_left_posterior   text,
  add column if not exists eye_health_left_notes       text;

-- ============================================================
-- 5. CLINICAL EXAMS: JSONB → flat columns
-- ============================================================

-- Drop JSONB columns
alter table public.clinical_exams
  drop column if exists far_vision,
  drop column if exists near_vision,
  drop column if exists lens_data;

-- Add medical_record_id FK (unique - 1:1 relation)
alter table public.clinical_exams
  add column if not exists medical_record_id uuid unique
    references public.medical_records(id) on delete set null;

-- Far vision flat columns
alter table public.clinical_exams
  add column if not exists far_right_sphere    numeric(5,2),
  add column if not exists far_right_cylinder  numeric(5,2),
  add column if not exists far_right_axis      integer,
  add column if not exists far_right_prism     numeric(5,2) default 0,
  add column if not exists far_right_base      text default '',
  add column if not exists far_right_addition  numeric(5,2),
  add column if not exists far_left_sphere     numeric(5,2),
  add column if not exists far_left_cylinder   numeric(5,2),
  add column if not exists far_left_axis       integer,
  add column if not exists far_left_prism      numeric(5,2) default 0,
  add column if not exists far_left_base       text default '',
  add column if not exists far_left_addition   numeric(5,2);

-- Near vision flat columns
alter table public.clinical_exams
  add column if not exists near_right_sphere    numeric(5,2),
  add column if not exists near_right_cylinder  numeric(5,2),
  add column if not exists near_right_axis      integer,
  add column if not exists near_right_prism     numeric(5,2),
  add column if not exists near_right_base      text,
  add column if not exists near_left_sphere     numeric(5,2),
  add column if not exists near_left_cylinder   numeric(5,2),
  add column if not exists near_left_axis       integer,
  add column if not exists near_left_prism      numeric(5,2),
  add column if not exists near_left_base       text;

-- Lens data (separate per eye)
alter table public.clinical_exams
  add column if not exists lens_data_right text,
  add column if not exists lens_data_left  text;

-- ============================================================
-- 6. PRODUCTS: fix status enum + add images + remove JSONB/inline supplier
-- ============================================================

-- Add new product status values (Prisma uses these)
alter type public.product_status add value if not exists 'in_stock';
alter type public.product_status add value if not exists 'low_stock';
alter type public.product_status add value if not exists 'discontinued';

-- Remove JSONB specifications column
alter table public.products
  drop column if exists specifications;

-- Remove inline supplier columns
alter table public.products
  drop column if exists supplier_id,
  drop column if exists supplier_name,
  drop column if exists supplier_contact;

-- Add images array
alter table public.products
  add column if not exists images text[] default '{}';

-- Note: default status change to 'in_stock' must be done after enum commit
-- Prisma handles this via @default(in_stock) in the schema

-- ============================================================
-- 7. PRODUCT_SPECIFICATIONS table
-- ============================================================

create table if not exists public.product_specifications (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null unique references public.products(id) on delete cascade,

  -- Frames / Sunglasses
  frame_type  text,
  material    text,
  color       text,
  lens_size   numeric(4,1),
  bridge      numeric(4,1),
  temple      numeric(5,1),

  -- Lenses
  lens_type     text,
  lens_material text,
  index         numeric(3,2),
  coatings      text[] default '{}',

  -- Contact lenses
  base_curve  numeric(4,2),
  diameter    numeric(4,1),
  power       text
);

-- ============================================================
-- 8. PRODUCT_SUPPLIERS table
-- ============================================================

create table if not exists public.product_suppliers (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null unique references public.products(id) on delete cascade,
  name        text not null,
  contact     text,
  email       text,
  phone       text
);

-- ============================================================
-- 9. APPOINTMENTS: add cancellation_reason
-- ============================================================

alter table public.appointments
  add column if not exists cancellation_reason text;

-- ============================================================
-- 10. SALES: add missing Prisma fields
-- ============================================================

alter table public.sales
  add column if not exists prescription_required boolean not null default false,
  add column if not exists warranty_expiry_date  date,
  add column if not exists warranty_terms        text;

-- Remove old single warranty_info if exists (replaced by two fields above)
alter table public.sales
  drop column if exists warranty_info;

-- ============================================================
-- 11. STOCK MOVEMENTS: fix date type (timestamptz → date)
-- ============================================================

alter table public.stock_movements
  alter column date type date using date::date;

-- ============================================================
-- 12. CLINIC SETTINGS table
-- ============================================================

create table if not exists public.clinic_settings (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  rfc        text,
  address    text,
  city       text,
  state      text,
  zip_code   text,
  phone      text,
  email      text,
  website    text,
  logo       text,
  tax_rate   numeric(4,2) not null default 0.16,
  currency   text not null default 'MXN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clinic_settings_updated_at
  before update on public.clinic_settings
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- RLS for new tables
-- ============================================================

alter table public.patient_insurances           enable row level security;
alter table public.patient_emergency_contacts   enable row level security;
alter table public.product_specifications       enable row level security;
alter table public.product_suppliers            enable row level security;
alter table public.clinic_settings              enable row level security;

-- patient_insurances: same as patients
create policy "patient_insurances: authenticated read"
  on public.patient_insurances for select using (auth.role() = 'authenticated');
create policy "patient_insurances: authenticated write"
  on public.patient_insurances for insert with check (auth.role() = 'authenticated');
create policy "patient_insurances: authenticated update"
  on public.patient_insurances for update using (auth.role() = 'authenticated');

-- patient_emergency_contacts: same as patients
create policy "emergency_contacts: authenticated read"
  on public.patient_emergency_contacts for select using (auth.role() = 'authenticated');
create policy "emergency_contacts: authenticated write"
  on public.patient_emergency_contacts for insert with check (auth.role() = 'authenticated');
create policy "emergency_contacts: authenticated update"
  on public.patient_emergency_contacts for update using (auth.role() = 'authenticated');

-- product_specifications / suppliers: same as products
create policy "product_specs: authenticated read"
  on public.product_specifications for select using (auth.role() = 'authenticated');
create policy "product_specs: admin/manager write"
  on public.product_specifications for insert
  with check (public.current_user_role() in ('admin', 'manager'));
create policy "product_specs: admin/manager update"
  on public.product_specifications for update
  using (public.current_user_role() in ('admin', 'manager'));

create policy "product_suppliers: authenticated read"
  on public.product_suppliers for select using (auth.role() = 'authenticated');
create policy "product_suppliers: admin/manager write"
  on public.product_suppliers for insert
  with check (public.current_user_role() in ('admin', 'manager'));
create policy "product_suppliers: admin/manager update"
  on public.product_suppliers for update
  using (public.current_user_role() in ('admin', 'manager'));

-- clinic_settings: all can read, only admin can write
create policy "clinic_settings: authenticated read"
  on public.clinic_settings for select using (auth.role() = 'authenticated');
create policy "clinic_settings: admin write"
  on public.clinic_settings for insert
  with check (public.current_user_role() = 'admin');
create policy "clinic_settings: admin update"
  on public.clinic_settings for update
  using (public.current_user_role() = 'admin');
