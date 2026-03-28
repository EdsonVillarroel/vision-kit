import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const users = [
    { email: 'admin@visionkit.com', name: 'Admin Principal', role: 'admin' as const },
    { email: 'gerente@visionkit.com', name: 'Gerente Principal', role: 'manager' as const },
    { email: 'optico1@visionkit.com', name: 'María García', role: 'optician' as const },
    { email: 'optico2@visionkit.com', name: 'Carlos Rodríguez', role: 'optician' as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        password: await bcrypt.hash('123456', 10),
        status: 'active',
      },
    });
    console.log(`✅ User: ${u.email}`);
  }

  await prisma.clinicSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Vision Kit Óptica',
      phone: '+52 55 0000 0000',
      email: 'contacto@visionkit.com',
      taxRate: 0.16,
      currency: 'MXN',
    },
  });
  console.log('✅ Clinic settings created');

  console.log('✅ Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
