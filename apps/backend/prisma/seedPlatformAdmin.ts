import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Seed del platform admin (gestión de la plataforma SaaS).
// El seed principal (seed.ts) NO crea platform admins — este script lo cubre.
// Idempotente (upsert): si el email ya existe, actualiza el password.
//
// Uso:
//   npm run db:seed:admin --workspace=apps/backend
//
// Configurable por env vars (defaults alineados con CLAUDE.md):
//   PLATFORM_ADMIN_EMAIL     (default: platform@visionkit.com)
//   PLATFORM_ADMIN_PASSWORD  (default: 123456 — CAMBIAR en producción)
//   PLATFORM_ADMIN_NAME      (default: Platform Admin)

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
  },
});

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL ?? 'platform@visionkit.com';
  const password = process.env.PLATFORM_ADMIN_PASSWORD ?? '123456';
  const name = process.env.PLATFORM_ADMIN_NAME ?? 'Platform Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.platformAdmin.upsert({
    where: { email },
    update: { passwordHash, name, status: 'active' },
    create: { email, passwordHash, name, status: 'active' },
  });

  console.log(`✅ Platform admin listo: ${admin.email} (status: ${admin.status})`);
  if (password === '123456') {
    console.warn('⚠️  Password por defecto "123456" — cambiálo en producción con PLATFORM_ADMIN_PASSWORD.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error al seedear platform admin:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
