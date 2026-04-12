import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// El seed usa DIRECT_URL para evitar limitaciones de PgBouncer
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
  },
});

const DEFAULT_TENANT_ID = '00000000-0000-4000-a000-000000000001';

async function main() {
  console.log('🌱 Seeding database...');

  // ── Usuarios ──────────────────────────────────────────────────────────────

  const users = [
    { email: 'admin@visionkit.com', name: 'Admin Principal', role: 'admin' as const },
    { email: 'gerente@visionkit.com', name: 'Gerente Principal', role: 'manager' as const },
    { email: 'optico1@visionkit.com', name: 'María García', role: 'optician' as const },
    { email: 'optico2@visionkit.com', name: 'Carlos Rodríguez', role: 'optician' as const },
  ];

  const createdUsers: Record<string, string> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        passwordHash: await bcrypt.hash('123456', 10),
        status: 'active',
      },
    });
    createdUsers[u.email] = user.id;
    console.log(`✅ User: ${u.email}`);
  }

  // ── Clinic Settings ───────────────────────────────────────────────────────

  await prisma.clinicSettings.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Vision Kit Óptica',
      phone: '+52 55 0000 0000',
      email: 'contacto@visionkit.com',
      taxRate: 0.16,
      currency: 'MXN',
    },
  });
  console.log('✅ Clinic settings created');

  // ── Pacientes ─────────────────────────────────────────────────────────────

  const patientsData = [
    {
      identificationId: 'CURP001MX',
      firstName: 'Ana',
      lastName: 'López Martínez',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'female' as const,
      phone: '+52 55 1234 5678',
      email: 'ana.lopez@email.com',
      address: 'Av. Insurgentes 456',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      status: 'frequent' as const,
      emergencyContact: {
        name: 'Pedro López',
        relationship: 'Esposo',
        phone: '+52 55 8765 4321',
      },
    },
    {
      identificationId: 'CURP002MX',
      firstName: 'Roberto',
      lastName: 'Hernández Soto',
      dateOfBirth: new Date('1972-11-30'),
      gender: 'male' as const,
      phone: '+52 55 2345 6789',
      email: 'roberto.hdz@email.com',
      address: 'Calle Reforma 789',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06700',
      status: 'normal' as const,
      medicalConditions: ['Diabetes Tipo 2', 'Hipertensión'],
      emergencyContact: {
        name: 'Laura Soto',
        relationship: 'Esposa',
        phone: '+52 55 9876 5432',
      },
      insurance: {
        provider: 'IMSS',
        policyNumber: 'IMSS-789456',
        groupNumber: 'GRP-001',
      },
    },
    {
      identificationId: 'CURP003MX',
      firstName: 'Sofía',
      lastName: 'González Reyes',
      dateOfBirth: new Date('1995-03-20'),
      gender: 'female' as const,
      phone: '+52 55 3456 7890',
      email: 'sofia.gzl@email.com',
      city: 'Guadalajara',
      state: 'Jalisco',
      zipCode: '44100',
      status: 'normal' as const,
      emergencyContact: {
        name: 'Carmen Reyes',
        relationship: 'Madre',
        phone: '+52 33 1234 5678',
      },
    },
    {
      identificationId: 'CURP004MX',
      firstName: 'Miguel',
      lastName: 'Torres Vega',
      dateOfBirth: new Date('1968-07-08'),
      gender: 'male' as const,
      phone: '+52 55 4567 8901',
      address: 'Blvd. Manuel Ávila 321',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '11590',
      status: 'warning' as const,
      warningReason: 'Paciente con historial de pagos pendientes',
      allergies: ['Penicilina'],
      emergencyContact: {
        name: 'Rosa Vega',
        relationship: 'Hermana',
        phone: '+52 55 5678 9012',
      },
      insurance: {
        provider: 'ISSSTE',
        policyNumber: 'ISS-321654',
      },
    },
    {
      identificationId: 'CURP005MX',
      firstName: 'Carmen',
      lastName: 'Díaz Fuentes',
      dateOfBirth: new Date('2001-09-12'),
      gender: 'female' as const,
      phone: '+52 55 5678 9012',
      email: 'carmen.diaz@email.com',
      address: 'Calle Morelos 654',
      city: 'Monterrey',
      state: 'Nuevo León',
      zipCode: '64000',
      status: 'normal' as const,
      emergencyContact: {
        name: 'Jorge Díaz',
        relationship: 'Padre',
        phone: '+52 81 1234 5678',
      },
    },
  ];

  const createdPatients: string[] = [];
  for (const { emergencyContact, insurance, ...patient } of patientsData) {
    const existing = await prisma.patient.findUnique({
      where: { tenantId_identificationId: { tenantId: DEFAULT_TENANT_ID, identificationId: patient.identificationId } },
    });
    if (existing) {
      createdPatients.push(existing.id);
      console.log(`⏭️  Patient already exists: ${patient.firstName} ${patient.lastName}`);
      continue;
    }
    const created = await prisma.patient.create({
      data: {
        ...patient,
        emergencyContact: { create: emergencyContact },
        insurance: insurance ? { create: insurance } : undefined,
      },
    });
    createdPatients.push(created.id);
    console.log(`✅ Patient: ${patient.firstName} ${patient.lastName}`);
  }

  // ── Productos de inventario ───────────────────────────────────────────────

  const productsData = [
    {
      sku: 'ARZ-RB-001',
      name: 'Armazón Ray-Ban Classic',
      category: 'frames' as const,
      brand: 'Ray-Ban',
      model: 'RB3025',
      costPrice: 450,
      sellingPrice: 1200,
      stock: 15,
      minStock: 5,
      specifications: {
        frameType: 'full-rim',
        material: 'Metal',
        color: 'Dorado',
        lensSize: 52,
        bridge: 18,
        temple: 140,
      },
      supplier: {
        name: 'Distribuidora Óptica Nacional',
        contact: 'Ventas',
        email: 'ventas@distriboptica.com',
        phone: '+52 55 0000 1111',
      },
    },
    {
      sku: 'ARZ-OAK-001',
      name: 'Armazón Oakley Sport',
      category: 'frames' as const,
      brand: 'Oakley',
      model: 'OX8046',
      costPrice: 600,
      sellingPrice: 1800,
      stock: 8,
      minStock: 3,
      specifications: {
        frameType: 'half-rim',
        material: 'Titanio',
        color: 'Negro',
        lensSize: 54,
        bridge: 17,
        temple: 138,
      },
      supplier: {
        name: 'Distribuidora Óptica Nacional',
        contact: 'Ventas',
        email: 'ventas@distriboptica.com',
        phone: '+52 55 0000 1111',
      },
    },
    {
      sku: 'LENT-PRG-001',
      name: 'Lente Progresivo Varilux',
      category: 'lenses' as const,
      brand: 'Essilor',
      model: 'Varilux S Series',
      costPrice: 800,
      sellingPrice: 2500,
      stock: 20,
      minStock: 10,
      specifications: {
        lensType: 'progressive',
        lensMaterial: 'Policarbonato',
        index: 1.67,
        coatings: ['AR', 'UV400', 'Antirreflejo'],
      },
      supplier: {
        name: 'Essilor México',
        contact: 'Servicio al cliente',
        email: 'mexico@essilor.com',
      },
    },
    {
      sku: 'LENT-MON-001',
      name: 'Lente Monofocal Transitions',
      category: 'lenses' as const,
      brand: 'Transitions',
      model: 'Gen 8',
      costPrice: 350,
      sellingPrice: 950,
      stock: 30,
      minStock: 15,
      specifications: {
        lensType: 'single-vision',
        lensMaterial: 'Orgánico',
        index: 1.5,
        coatings: ['Fotocromático', 'UV400'],
      },
      supplier: {
        name: 'Essilor México',
        contact: 'Servicio al cliente',
        email: 'mexico@essilor.com',
      },
    },
    {
      sku: 'LC-ACUVUE-001',
      name: 'Lentes de Contacto Acuvue Oasys',
      category: 'contact_lenses' as const,
      brand: 'Acuvue',
      model: 'Oasys 1-Day',
      costPrice: 180,
      sellingPrice: 450,
      stock: 3,
      minStock: 10,
      specifications: {
        baseCurve: 8.5,
        diameter: 14.3,
        power: '-1.00 to -6.00',
      },
      supplier: {
        name: 'Johnson & Johnson México',
        email: 'optica@jj.com',
      },
    },
    {
      sku: 'SOL-RB-001',
      name: 'Lentes de Sol Ray-Ban Aviator',
      category: 'sunglasses' as const,
      brand: 'Ray-Ban',
      model: 'RB3025',
      costPrice: 500,
      sellingPrice: 1500,
      stock: 12,
      minStock: 5,
      specifications: {
        frameType: 'full-rim',
        material: 'Metal',
        color: 'Plateado',
        lensType: 'polarized',
        lensSize: 58,
      },
      supplier: {
        name: 'Distribuidora Óptica Nacional',
        contact: 'Ventas',
        email: 'ventas@distriboptica.com',
      },
    },
    {
      sku: 'ACC-CASE-001',
      name: 'Estuche Rígido Premium',
      category: 'accessories' as const,
      brand: 'VisionKit',
      costPrice: 50,
      sellingPrice: 150,
      stock: 40,
      minStock: 20,
      supplier: {
        name: 'Accesorios Ópticos MX',
        phone: '+52 55 1111 2222',
      },
    },
    {
      sku: 'SOL-SOL-001',
      name: 'Solución Limpiadora de Lentes',
      category: 'solutions' as const,
      brand: 'Alcon',
      model: 'Opti-Free',
      costPrice: 80,
      sellingPrice: 220,
      stock: 25,
      minStock: 10,
      supplier: {
        name: 'Alcon México',
        email: 'ventas@alcon.mx',
      },
    },
  ];

  const createdProducts: string[] = [];
  for (const { specifications, supplier, ...product } of productsData) {
    const existing = await prisma.product.findUnique({ where: { tenantId_sku: { tenantId: DEFAULT_TENANT_ID, sku: product.sku } } });
    if (existing) {
      createdProducts.push(existing.id);
      console.log(`⏭️  Product already exists: ${product.name}`);
      continue;
    }
    const created = await prisma.product.create({
      data: {
        ...product,
        status: product.stock === 0
          ? 'out_of_stock'
          : product.stock <= product.minStock
            ? 'low_stock'
            : 'in_stock',
        specifications: specifications ? { create: specifications } : undefined,
        supplier: supplier ? { create: supplier } : undefined,
      },
    });
    createdProducts.push(created.id);
    console.log(`✅ Product: ${product.name}`);
  }

  // ── Citas de prueba ───────────────────────────────────────────────────────

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const optico1Id = createdUsers['optico1@visionkit.com'];
  const optico2Id = createdUsers['optico2@visionkit.com'];

  const appointmentsData = [
    {
      patientId: createdPatients[0],
      practitionerId: optico1Id,
      date: today,
      time: '09:00',
      type: 'eye_exam' as const,
      status: 'confirmed' as const,
      reason: 'Revisión anual de la vista',
    },
    {
      patientId: createdPatients[1],
      practitionerId: optico1Id,
      date: today,
      time: '10:00',
      type: 'followup' as const,
      status: 'scheduled' as const,
      reason: 'Seguimiento post-cirugía',
    },
    {
      patientId: createdPatients[2],
      practitionerId: optico2Id,
      date: today,
      time: '11:30',
      type: 'contact_lens_fitting' as const,
      status: 'scheduled' as const,
      reason: 'Adaptación de lentes de contacto',
    },
    {
      patientId: createdPatients[3],
      practitionerId: optico1Id,
      date: tomorrow,
      time: '09:30',
      type: 'eye_exam' as const,
      status: 'scheduled' as const,
      reason: 'Primera consulta',
    },
    {
      patientId: createdPatients[4],
      practitionerId: optico2Id,
      date: nextWeek,
      time: '14:00',
      type: 'frame_selection' as const,
      status: 'scheduled' as const,
      reason: 'Selección de armazón',
    },
  ];

  const adminId = createdUsers['admin@visionkit.com'];

  for (let i = 0; i < appointmentsData.length; i++) {
    const apt = appointmentsData[i];
    const duration = 30;
    const [h, m] = apt.time.split(':').map(Number);
    const total = h * 60 + m + duration;
    const endTime = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    const appointmentNumber = `APT-SEED-${String(i + 1).padStart(3, '0')}`;
    const dateStr = apt.date.toISOString().split('T')[0];

    // Los enums en DB usan guiones (el @map en Prisma); mapear explícitamente
    const dbType: Record<string, string> = {
      eye_exam: 'eye-exam',
      contact_lens_fitting: 'contact-lens-fitting',
      frame_selection: 'frame-selection',
      followup: 'followup',
      emergency: 'emergency',
      adjustment: 'adjustment',
    };
    const dbStatus: Record<string, string> = {
      scheduled: 'scheduled',
      confirmed: 'confirmed',
      in_progress: 'in-progress',
      completed: 'completed',
      cancelled: 'cancelled',
      no_show: 'no-show',
    };

    // Usar SQL raw para evitar incompatibilidades con PgBouncer y campos de tipo Date
    await prisma.$executeRawUnsafe(`
      INSERT INTO appointments (
        id, appointment_number, patient_id, practitioner_id,
        date, time, duration, end_time, type, status,
        reason, reminder_sent, created_by_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid,
        $4::date, $5::time, $6, $7::time, $8::appointment_type, $9::appointment_status,
        $10, false, $11::uuid, now(), now()
      ) ON CONFLICT (appointment_number) DO NOTHING
    `,
      appointmentNumber,
      apt.patientId,
      apt.practitionerId,
      dateStr,
      apt.time,
      duration,
      endTime,
      dbType[apt.type] ?? apt.type,
      dbStatus[apt.status] ?? apt.status,
      apt.reason ?? null,
      adminId,
    );
    console.log(`✅ Appointment: ${apt.type} at ${apt.time}`);
  }

  console.log('\n✅ Seed completed!');
  console.log(`   Users: ${users.length}`);
  console.log(`   Patients: ${patientsData.length}`);
  console.log(`   Products: ${productsData.length}`);
  console.log(`   Appointments: ${appointmentsData.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
