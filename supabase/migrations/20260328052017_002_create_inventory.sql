-- ============================================================
-- 002: Inventory (Products & Stock Movements)
-- ============================================================

create type public.product_category as enum (
  'frames', 'lenses', 'sunglasses', 'contact-lenses', 'accessories', 'solutions'
);

create type public.product_status as enum ('active', 'inactive', 'out_of_stock');

create table public.products (
  id              uuid primary key default gen_random_uuid(),
  sku             text not null unique,
  name            text not null,
  category        public.product_category not null,
  brand           text,
  model           text,
  description     text,

  -- Pricing
  cost_price      numeric(10,2) not null default 0,
  selling_price   numeric(10,2) not null default 0,
  discount        numeric(5,2) default 0,

  -- Stock
  stock           integer not null default 0,
  min_stock       integer not null default 0,
  max_stock       integer,
  status          public.product_status not null default 'active',

  -- Specifications (flexible JSONB)
  specifications  jsonb default '{}',

  -- Supplier
  supplier_id     text,
  supplier_name   text,
  supplier_contact text,

  last_restocked  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create index products_category_idx on public.products(category);
create index products_status_idx on public.products(status);
create index products_sku_idx on public.products(sku);

-- ============================================================
-- Stock Movements
-- ============================================================

create type public.movement_type as enum ('in', 'out', 'adjustment');

create table public.stock_movements (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  type            public.movement_type not null,
  quantity        integer not null,
  previous_stock  integer not null,
  new_stock       integer not null,
  reason          text not null,
  reference       text,
  notes           text,
  performed_by_id   uuid references public.profiles(id),
  performed_by_name text,
  date            timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index stock_movements_product_idx on public.stock_movements(product_id);
create index stock_movements_date_idx on public.stock_movements(date);
