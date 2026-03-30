-- ============================================================
-- 007: Fix enum types to match Prisma naming
-- ============================================================
-- Creates user_status enum (profiles.status was text with check constraint)
-- All other enums already exist with the correct snake_case names;
-- Prisma now maps to them via @@map directives.
-- ============================================================

-- Create user_status enum type
create type public.user_status as enum ('active', 'inactive');

-- Alter profiles.status column from text to user_status enum
alter table public.profiles
  alter column status drop default;

alter table public.profiles
  alter column status type public.user_status
  using status::public.user_status;

alter table public.profiles
  alter column status set default 'active'::public.user_status;
