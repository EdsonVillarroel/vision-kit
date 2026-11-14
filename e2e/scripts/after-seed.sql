-- Suscripción activa al plan más completo (sin cuotas que interfieran) + un super_admin de prueba
\set tenant '00000000-0000-4000-a000-000000000001'

INSERT INTO subscriptions (id, tenant_id, plan_id, status, updated_at)
SELECT gen_random_uuid(), :'tenant', id, 'active', now()
FROM subscription_plans ORDER BY price DESC LIMIT 1;

UPDATE profiles SET role = 'super_admin' WHERE email = 'gerente@visionkit.com';
