-- ============================================================
-- 008: Fix appointments table — make denormalized columns nullable
-- ============================================================
-- The original migration 003 created patient_name, patient_phone,
-- patient_email, practitioner_name, created_by_name as text columns.
-- The Prisma schema uses FK relations instead, so these columns are
-- not managed by Prisma and must be nullable to avoid constraint errors.
-- ============================================================

-- Make denormalized text columns nullable
alter table public.appointments
  alter column patient_name      drop not null;

-- patient_phone, patient_email, practitioner_name, created_by_name
-- are already nullable — nothing to change for those.
