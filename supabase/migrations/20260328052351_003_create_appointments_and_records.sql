-- ============================================================
-- 003: Appointments, Medical Records & Clinical Exams
-- ============================================================

-- ============================================================
-- Appointments
-- ============================================================

create type public.appointment_type as enum (
  'eye-exam', 'contact-lens-fitting', 'followup',
  'emergency', 'frame-selection', 'adjustment'
);

create type public.appointment_status as enum (
  'scheduled', 'confirmed', 'in-progress',
  'completed', 'cancelled', 'no-show'
);

create table public.appointments (
  id                  uuid primary key default gen_random_uuid(),
  appointment_number  text not null unique,
  patient_id          uuid not null references public.patients(id) on delete restrict,
  patient_name        text not null,
  patient_phone       text,
  patient_email       text,

  date                date not null,
  time                time not null,
  duration            integer not null default 30, -- minutes
  end_time            time,

  type                public.appointment_type not null,
  status              public.appointment_status not null default 'scheduled',

  practitioner_id     uuid references public.profiles(id),
  practitioner_name   text,

  reason              text,
  notes               text,
  medical_record_id   uuid, -- FK added after medical_records table

  reminder_sent       boolean default false,
  reminder_sent_at    timestamptz,

  created_by_id       uuid references public.profiles(id),
  created_by_name     text,

  confirmed_at        timestamptz,
  completed_at        timestamptz,
  cancelled_at        timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute procedure public.set_updated_at();

create index appointments_patient_idx on public.appointments(patient_id);
create index appointments_date_idx on public.appointments(date);
create index appointments_status_idx on public.appointments(status);

-- ============================================================
-- Medical Records
-- ============================================================

create type public.exam_type as enum ('routine', 'emergency', 'followup', 'contact-lens');

create table public.medical_records (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references public.patients(id) on delete restrict,
  date            date not null,
  exam_type       public.exam_type not null default 'routine',

  -- Visual Acuity (JSONB por flexibilidad)
  visual_acuity   jsonb default '{}',
  -- { right: { uncorrected, corrected }, left: { uncorrected, corrected } }

  -- Refraction
  refraction      jsonb default '{}',
  -- { right: EyeMeasurement, left: EyeMeasurement }

  -- Prescription
  prescription    jsonb default '{}',
  -- { right, left, frameType, lensType, coatings[] }

  -- Intraocular pressure
  iop_right       numeric(5,2),
  iop_left        numeric(5,2),
  iop_unit        text default 'mmHg',

  -- Eye health
  eye_health      jsonb default '{}',
  -- { right: { anterior, posterior, notes }, left: {...} }

  diagnosis       text[] default '{}',
  notes           text,
  next_visit_recommended date,

  practitioner_id   uuid references public.profiles(id),
  practitioner_name text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger medical_records_updated_at
  before update on public.medical_records
  for each row execute procedure public.set_updated_at();

-- Add FK from appointments to medical_records
alter table public.appointments
  add constraint appointments_medical_record_fk
  foreign key (medical_record_id) references public.medical_records(id);

create index medical_records_patient_idx on public.medical_records(patient_id);
create index medical_records_date_idx on public.medical_records(date);

-- ============================================================
-- Clinical Exams
-- ============================================================

create table public.clinical_exams (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid not null references public.patients(id) on delete restrict,
  patient_name        text not null,
  exam_number         text not null unique,
  date                date not null,

  -- Vision measurements (JSONB)
  far_vision          jsonb default '{}',
  -- { right: EyeMeasurement, left: EyeMeasurement }
  near_vision         jsonb default '{}',

  -- Pupillary distance
  pd_right            numeric(5,2),
  pd_left             numeric(5,2),
  pd_near_right       numeric(5,2),
  pd_near_left        numeric(5,2),

  -- Frame measurements
  frame_height        numeric(5,2),
  frame_right         numeric(5,2),
  frame_left          numeric(5,2),

  -- Lens data
  lens_data           jsonb default '{}',

  observations        text,

  examiner_id         uuid references public.profiles(id),
  examiner_name       text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger clinical_exams_updated_at
  before update on public.clinical_exams
  for each row execute procedure public.set_updated_at();

create index clinical_exams_patient_idx on public.clinical_exams(patient_id);
create index clinical_exams_date_idx on public.clinical_exams(date);
