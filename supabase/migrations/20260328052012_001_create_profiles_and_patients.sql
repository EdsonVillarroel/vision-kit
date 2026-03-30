-- ============================================================
-- 001: Profiles & Patients
-- ============================================================

-- Roles enum
create type public.user_role as enum ('admin', 'manager', 'optician');

-- Profiles (extends auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null,
  role        public.user_role not null default 'optician',
  phone       text,
  avatar_url  text,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: auto-create profile on new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'optician')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: auto updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Patients
-- ============================================================

create type public.patient_status as enum ('frequent', 'warning', 'normal');
create type public.gender_type as enum ('male', 'female', 'other');

create table public.patients (
  id                     uuid primary key default gen_random_uuid(),
  identification_id      text not null,
  first_name             text not null,
  last_name              text not null,
  date_of_birth          date,
  gender                 public.gender_type,
  phone                  text,
  email                  text,
  address                text,
  city                   text,
  state                  text,
  zip_code               text,

  -- Insurance
  insurance_provider     text,
  insurance_policy       text,
  insurance_group        text,

  -- Emergency contact
  emergency_name         text,
  emergency_relationship text,
  emergency_phone        text,

  -- Clinical info
  allergies              text[] default '{}',
  medical_conditions     text[] default '{}',

  -- Status
  status                 public.patient_status not null default 'normal',
  warning_reason         text,
  visit_count            integer not null default 0,
  total_spent            numeric(10,2) not null default 0,
  notes                  text,
  last_visit             timestamptz,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger patients_updated_at
  before update on public.patients
  for each row execute procedure public.set_updated_at();

create index patients_identification_idx on public.patients(identification_id);
create index patients_name_idx on public.patients(first_name, last_name);
