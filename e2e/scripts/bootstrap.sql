-- Prepara una base Postgres vacía (creada con `prisma db push`) para correr las pruebas E2E.
-- En Supabase estos defaults y el tenant salen de las migraciones SQL; `db push` no los crea.
\set tenant '00000000-0000-4000-a000-000000000001'

INSERT INTO tenants (id, name, slug, updated_at)
VALUES (:'tenant', 'Visión 20/20 HD', 'vision-2020-hd', now())
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.columns
           WHERE column_name = 'tenant_id' AND table_schema = 'public' AND table_name <> 'subscriptions'
  LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET DEFAULT %L', r.table_name, '00000000-0000-4000-a000-000000000001');
  END LOOP;
END $$;
