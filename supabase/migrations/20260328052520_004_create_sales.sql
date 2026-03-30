-- ============================================================
-- 004: Sales, Sale Items & Payments
-- ============================================================

create type public.sale_status as enum ('pending', 'completed', 'cancelled', 'refunded');
create type public.payment_method as enum ('cash', 'card', 'transfer', 'check', 'mixed');

create table public.sales (
  id                  uuid primary key default gen_random_uuid(),
  sale_number         text not null unique,
  date                timestamptz not null default now(),

  patient_id          uuid references public.patients(id) on delete restrict,
  patient_name        text,

  -- Totals
  subtotal            numeric(10,2) not null default 0,
  discount            numeric(10,2) not null default 0,
  tax                 numeric(10,2) not null default 0,
  total               numeric(10,2) not null default 0,

  payment_method      public.payment_method not null default 'cash',
  status              public.sale_status not null default 'pending',

  warranty_info       text,
  medical_record_id   uuid references public.medical_records(id),
  notes               text,

  sold_by_id          uuid references public.profiles(id),
  sold_by_name        text,

  completed_at        timestamptz,
  cancelled_at        timestamptz,
  refunded_at         timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger sales_updated_at
  before update on public.sales
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Sale Items
-- ============================================================

create table public.sale_items (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid not null references public.sales(id) on delete cascade,
  product_id    uuid references public.products(id) on delete restrict,
  product_name  text not null,
  product_sku   text,
  quantity      integer not null default 1,
  unit_price    numeric(10,2) not null,
  discount      numeric(10,2) not null default 0,
  subtotal      numeric(10,2) not null,
  total         numeric(10,2) not null,
  created_at    timestamptz not null default now()
);

create index sale_items_sale_idx on public.sale_items(sale_id);
create index sale_items_product_idx on public.sale_items(product_id);

-- ============================================================
-- Payments
-- ============================================================

create table public.payments (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references public.sales(id) on delete cascade,
  method      public.payment_method not null,
  amount      numeric(10,2) not null,
  reference   text,
  created_at  timestamptz not null default now()
);

create index payments_sale_idx on public.payments(sale_id);

-- ============================================================
-- Indexes for sales reporting
-- ============================================================
create index sales_date_idx on public.sales(date);
create index sales_patient_idx on public.sales(patient_id);
create index sales_status_idx on public.sales(status);
