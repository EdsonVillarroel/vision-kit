-- ============================================================
-- 009: Add cancellation_reason to sales table
-- ============================================================
-- The backend updateStatus() currently stores the cancellation
-- reason in the notes field. This migration adds a dedicated
-- column so it is stored separately from general notes.
-- ============================================================

alter table public.sales
  add column if not exists cancellation_reason text;
