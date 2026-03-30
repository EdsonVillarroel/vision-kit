-- ============================================================
-- 005: Row Level Security Policies
-- ============================================================

-- Helper: get current user's role
create or replace function public.current_user_role()
returns public.user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.patients         enable row level security;
alter table public.appointments     enable row level security;
alter table public.medical_records  enable row level security;
alter table public.clinical_exams   enable row level security;
alter table public.products         enable row level security;
alter table public.stock_movements  enable row level security;
alter table public.sales            enable row level security;
alter table public.sale_items       enable row level security;
alter table public.payments         enable row level security;

-- ============================================================
-- Profiles policies
-- ============================================================

-- Cada usuario ve su propio perfil
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin y manager ven todos los perfiles
create policy "profiles: admin/manager read all"
  on public.profiles for select
  using (public.current_user_role() in ('admin', 'manager'));

-- Solo admin puede actualizar cualquier perfil
create policy "profiles: admin update"
  on public.profiles for update
  using (public.current_user_role() = 'admin');

-- Cada usuario puede actualizar su propio perfil
create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Solo admin puede insertar perfiles manualmente (trigger lo hace automático)
create policy "profiles: admin insert"
  on public.profiles for insert
  with check (public.current_user_role() = 'admin');

-- Solo admin puede eliminar usuarios
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.current_user_role() = 'admin');

-- ============================================================
-- Patients policies
-- ============================================================

-- Todos los autenticados pueden ver pacientes
create policy "patients: authenticated read"
  on public.patients for select
  using (auth.role() = 'authenticated');

-- Todos los autenticados pueden crear pacientes
create policy "patients: authenticated insert"
  on public.patients for insert
  with check (auth.role() = 'authenticated');

-- Todos los autenticados pueden editar pacientes
create policy "patients: authenticated update"
  on public.patients for update
  using (auth.role() = 'authenticated');

-- Solo admin puede eliminar pacientes
create policy "patients: admin delete"
  on public.patients for delete
  using (public.current_user_role() = 'admin');

-- ============================================================
-- Appointments policies
-- ============================================================

create policy "appointments: authenticated read"
  on public.appointments for select
  using (auth.role() = 'authenticated');

create policy "appointments: authenticated insert"
  on public.appointments for insert
  with check (auth.role() = 'authenticated');

create policy "appointments: authenticated update"
  on public.appointments for update
  using (auth.role() = 'authenticated');

create policy "appointments: admin delete"
  on public.appointments for delete
  using (public.current_user_role() = 'admin');

-- ============================================================
-- Medical Records & Clinical Exams policies
-- ============================================================

create policy "medical_records: authenticated read"
  on public.medical_records for select
  using (auth.role() = 'authenticated');

create policy "medical_records: authenticated insert"
  on public.medical_records for insert
  with check (auth.role() = 'authenticated');

create policy "medical_records: authenticated update"
  on public.medical_records for update
  using (auth.role() = 'authenticated');

create policy "medical_records: admin delete"
  on public.medical_records for delete
  using (public.current_user_role() = 'admin');

create policy "clinical_exams: authenticated read"
  on public.clinical_exams for select
  using (auth.role() = 'authenticated');

create policy "clinical_exams: authenticated insert"
  on public.clinical_exams for insert
  with check (auth.role() = 'authenticated');

create policy "clinical_exams: authenticated update"
  on public.clinical_exams for update
  using (auth.role() = 'authenticated');

create policy "clinical_exams: admin delete"
  on public.clinical_exams for delete
  using (public.current_user_role() = 'admin');

-- ============================================================
-- Inventory policies
-- ============================================================

-- Todos ven productos
create policy "products: authenticated read"
  on public.products for select
  using (auth.role() = 'authenticated');

-- Admin y manager pueden crear/editar productos
create policy "products: admin/manager write"
  on public.products for insert
  with check (public.current_user_role() in ('admin', 'manager'));

create policy "products: admin/manager update"
  on public.products for update
  using (public.current_user_role() in ('admin', 'manager'));

create policy "products: admin delete"
  on public.products for delete
  using (public.current_user_role() = 'admin');

-- Stock movements
create policy "stock_movements: authenticated read"
  on public.stock_movements for select
  using (auth.role() = 'authenticated');

create policy "stock_movements: authenticated insert"
  on public.stock_movements for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Sales policies
-- ============================================================

create policy "sales: authenticated read"
  on public.sales for select
  using (auth.role() = 'authenticated');

create policy "sales: authenticated insert"
  on public.sales for insert
  with check (auth.role() = 'authenticated');

create policy "sales: authenticated update"
  on public.sales for update
  using (auth.role() = 'authenticated');

create policy "sales: admin delete"
  on public.sales for delete
  using (public.current_user_role() = 'admin');

create policy "sale_items: authenticated read"
  on public.sale_items for select
  using (auth.role() = 'authenticated');

create policy "sale_items: authenticated insert"
  on public.sale_items for insert
  with check (auth.role() = 'authenticated');

create policy "payments: authenticated read"
  on public.payments for select
  using (auth.role() = 'authenticated');

create policy "payments: authenticated insert"
  on public.payments for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Storage: Buckets y políticas
-- ============================================================

-- Bucket: avatars (privado, solo autenticados)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', false, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Bucket: product-images (público para lectura)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Storage policies: avatars
create policy "avatars: own read"
  on storage.objects for select
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars: own upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars: own update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars: own delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: product-images
create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product-images: admin/manager upload"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and public.current_user_role() in ('admin', 'manager')
  );

create policy "product-images: admin/manager delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and public.current_user_role() in ('admin', 'manager')
  );
