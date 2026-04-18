import { PrismaClient, Prisma } from '@prisma/client';

// Seed de los 4 tiers comerciales de Vision Kit (Bolivia).
// Estructura alineada con docs/BUSINESS_PLAN.md §2.1.
// Crea 7 filas en subscription_plans: 1 free + 3 paid × (monthly + yearly).
// Anual = price mensual × 12 × 0.8 (descuento 20%).

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
  },
});

type PlanSeed = {
  slug: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  maxUsers: number;
  maxPatients: number;
  maxProducts: number;
  maxStorageMb: number;
  sortOrder: number;
  features: Prisma.InputJsonValue;
};

// `-1` = ilimitado. El guard traduce a "sin límite".
const UNLIMITED = -1;

const escaparateFeatures = {
  public_portal: true,
  public_bookings_per_month: 5,
  email_reminders: false,
  whatsapp_reminders: false,
  whatsapp_included_messages: 0,
  clinical_exams_level: 'basic',
  digital_prescription_qr: false,
  workshop_module: false,
  commissions: false,
  basic_reports: false,
  advanced_reports: false,
  multi_branch: false,
  stock_transfers: false,
  custom_domain: false,
  sin_invoicing: false,
  api_access: false,
  exports: 'patients_only',
  backup_frequency: 'weekly',
  backup_retention_days: 7,
  branded_portal: true,
  support_level: 'email_48h',
  onboarding: 'self_service',
  max_sales_per_month: 20,
  max_branches: 1,
};

const consultorioFeatures = {
  public_portal: true,
  public_bookings_per_month: UNLIMITED,
  email_reminders: true,
  whatsapp_reminders: false,
  whatsapp_included_messages: 0,
  clinical_exams_level: 'full',
  digital_prescription_qr: true,
  workshop_module: false,
  commissions: false,
  basic_reports: true,
  advanced_reports: false,
  multi_branch: false,
  stock_transfers: false,
  custom_domain: false,
  sin_invoicing: false,
  api_access: false,
  exports: 'all',
  backup_frequency: 'daily',
  backup_retention_days: 30,
  branded_portal: true,
  support_level: 'email_24h',
  onboarding: 'video_1h',
  max_sales_per_month: 200,
  max_branches: 1,
};

const opticaProFeatures = {
  public_portal: true,
  public_bookings_per_month: UNLIMITED,
  email_reminders: true,
  whatsapp_reminders: true,
  whatsapp_included_messages: 500,
  clinical_exams_level: 'full_with_templates',
  digital_prescription_qr: true,
  workshop_module: true,
  commissions: true,
  basic_reports: true,
  advanced_reports: true,
  multi_branch: false,
  stock_transfers: false,
  custom_domain: false,
  sin_invoicing: false,
  api_access: false,
  exports: 'all',
  backup_frequency: 'daily',
  backup_retention_days: 60,
  branded_portal: false,
  support_level: 'whatsapp_email_8h',
  onboarding: 'video_2h_plus_migration',
  max_sales_per_month: 2000,
  max_branches: 1,
};

const cadenaFeatures = {
  public_portal: true,
  public_bookings_per_month: UNLIMITED,
  email_reminders: true,
  whatsapp_reminders: true,
  whatsapp_included_messages: 3000,
  clinical_exams_level: 'full_with_templates',
  digital_prescription_qr: true,
  workshop_module: true,
  commissions: true,
  basic_reports: true,
  advanced_reports: true,
  multi_branch: true,
  stock_transfers: true,
  custom_domain: true,
  sin_invoicing: true,
  api_access: true,
  exports: 'all_with_scheduled',
  backup_frequency: 'daily',
  backup_retention_days: 90,
  backup_on_demand: true,
  branded_portal: false,
  support_level: 'whatsapp_dedicated_sla_4h',
  onboarding: 'full_migration_onsite',
  max_sales_per_month: UNLIMITED,
  max_branches: 3,
};

const yearlyPrice = (monthly: number) => Math.round(monthly * 12 * 0.8 * 100) / 100;

const plans: PlanSeed[] = [
  // Free — solo mensual (no tiene sentido anual)
  {
    slug: 'escaparate',
    name: 'Escaparate',
    price: 0,
    billingPeriod: 'monthly',
    maxUsers: 1,
    maxPatients: 50,
    maxProducts: 30,
    maxStorageMb: 100,
    sortOrder: 10,
    features: escaparateFeatures,
  },
  // Consultorio
  {
    slug: 'consultorio-mensual',
    name: 'Consultorio (Mensual)',
    price: 249,
    billingPeriod: 'monthly',
    maxUsers: 2,
    maxPatients: 500,
    maxProducts: 300,
    maxStorageMb: 2_000,
    sortOrder: 20,
    features: consultorioFeatures,
  },
  {
    slug: 'consultorio-anual',
    name: 'Consultorio (Anual)',
    price: yearlyPrice(249), // Bs 2,390.40
    billingPeriod: 'yearly',
    maxUsers: 2,
    maxPatients: 500,
    maxProducts: 300,
    maxStorageMb: 2_000,
    sortOrder: 21,
    features: consultorioFeatures,
  },
  // Óptica Pro
  {
    slug: 'optica-pro-mensual',
    name: 'Óptica Pro (Mensual)',
    price: 549,
    billingPeriod: 'monthly',
    maxUsers: 6,
    maxPatients: 5_000,
    maxProducts: 2_000,
    maxStorageMb: 10_000,
    sortOrder: 30,
    features: opticaProFeatures,
  },
  {
    slug: 'optica-pro-anual',
    name: 'Óptica Pro (Anual)',
    price: yearlyPrice(549), // Bs 5,270.40
    billingPeriod: 'yearly',
    maxUsers: 6,
    maxPatients: 5_000,
    maxProducts: 2_000,
    maxStorageMb: 10_000,
    sortOrder: 31,
    features: opticaProFeatures,
  },
  // Cadena
  {
    slug: 'cadena-mensual',
    name: 'Cadena (Mensual)',
    price: 1_199,
    billingPeriod: 'monthly',
    maxUsers: 15,
    maxPatients: UNLIMITED,
    maxProducts: UNLIMITED,
    maxStorageMb: 50_000,
    sortOrder: 40,
    features: cadenaFeatures,
  },
  {
    slug: 'cadena-anual',
    name: 'Cadena (Anual)',
    price: yearlyPrice(1_199), // Bs 11,510.40
    billingPeriod: 'yearly',
    maxUsers: 15,
    maxPatients: UNLIMITED,
    maxProducts: UNLIMITED,
    maxStorageMb: 50_000,
    sortOrder: 41,
    features: cadenaFeatures,
  },
];

async function main() {
  console.log('🌱 Seeding subscription plans (Bolivia)...');

  for (const plan of plans) {
    const { slug, ...data } = plan;
    await prisma.subscriptionPlan.upsert({
      where: { slug },
      update: {
        name: data.name,
        price: data.price,
        billingPeriod: data.billingPeriod,
        maxUsers: data.maxUsers,
        maxPatients: data.maxPatients,
        maxProducts: data.maxProducts,
        maxStorageMb: data.maxStorageMb,
        sortOrder: data.sortOrder,
        features: data.features,
        isActive: true,
      },
      create: {
        slug,
        currency: 'BOB',
        isActive: true,
        ...data,
      },
    });
    console.log(`✅ Plan: ${slug} (Bs ${data.price.toLocaleString('es-BO')})`);
  }

  console.log(`\n✅ Seeded ${plans.length} plans`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
