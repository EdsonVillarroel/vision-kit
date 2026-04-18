import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── TENANTS ──────────────────────────────────────────────────────────────

  async findAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { users: true, patients: true },
        },
      },
    });
  }

  async findTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { users: true, patients: true, products: true, sales: true },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    return tenant;
  }

  async provisionTenant(dto: CreateTenantDto) {
    // Verify plan exists
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');

    // Check slug is unique
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('El slug ya está en uso');

    // Check super_admin email not taken
    const emailTaken = await this.prisma.user.findUnique({
      where: { email: dto.superAdminEmail },
    });
    if (emailTaken) throw new ConflictException('El email del super admin ya está registrado');

    const passwordHash = await bcrypt.hash(dto.superAdminPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          primaryColor: dto.primaryColor,
          secondaryColor: dto.secondaryColor,
          accentColor: dto.accentColor,
          domain: dto.domain,
        },
      });

      // 2. Create subscription
      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: dto.planId,
          status: 'active',
        },
      });

      // 3. Create super_admin user
      const superAdmin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.superAdminEmail,
          name: dto.superAdminName,
          passwordHash,
          role: 'super_admin',
          status: 'active',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      return { tenant, subscription, superAdmin };
    });

    return result;
  }

  async updateTenant(id: string, dto: UpdateTenantDto) {
    await this.findTenantById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async suspendTenant(id: string) {
    await this.findTenantById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'suspended' },
    });
  }

  async activateTenant(id: string) {
    await this.findTenantById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  // ─── PLANS ────────────────────────────────────────────────────────────────

  async findAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { subscriptions: true } } },
    });
  }

  async createPlan(dto: CreatePlanDto) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('El slug del plan ya existe');

    return this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        price: dto.price,
        currency: dto.currency ?? 'BOB',
        billingPeriod: (dto.billingPeriod as any) ?? 'monthly',
        maxUsers: dto.maxUsers,
        maxPatients: dto.maxPatients,
        maxProducts: dto.maxProducts,
        maxStorageMb: dto.maxStorageMb,
        features: (dto.features ?? {}) as any,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return this.prisma.subscriptionPlan.update({ where: { id }, data: dto as any });
  }

  // ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────

  async findAllSubscriptions() {
    return this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, name: true, slug: true, status: true } },
        plan: { select: { id: true, name: true, price: true, currency: true } },
      },
    });
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    if (dto.planId) {
      const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: dto.planId } });
      if (!plan) throw new NotFoundException('Plan no encontrado');
    }

    const data: any = {};
    if (dto.planId) data.planId = dto.planId;
    if (dto.status) data.status = dto.status;
    if (dto.expiresAt) data.expiresAt = new Date(dto.expiresAt);
    if (dto.paymentNotes !== undefined) data.paymentNotes = dto.paymentNotes;
    if (dto.status === 'cancelled') data.cancelledAt = new Date();

    return this.prisma.subscription.update({
      where: { id },
      data,
      include: {
        tenant: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    });
  }

  // ─── METRICS ──────────────────────────────────────────────────────────────

  async getMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Suscripciones que cuentan como "revenue" → active + trial, con plan cargado
    // MRR: yearly se normaliza dividiendo el precio entre 12.
    const revenueSubs = await this.prisma.subscription.findMany({
      where: { status: { in: ['active', 'trial'] } },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            billingPeriod: true,
          },
        },
      },
    });

    const planAgg = new Map<
      string,
      { planSlug: string; planName: string; count: number; mrrContribution: number }
    >();
    let mrr = 0;

    for (const sub of revenueSubs) {
      const rawPrice = Number(sub.plan.price);
      const monthly =
        sub.plan.billingPeriod === 'yearly' ? rawPrice / 12 : rawPrice;
      mrr += monthly;

      const key = sub.plan.id;
      const existing = planAgg.get(key);
      if (existing) {
        existing.count += 1;
        existing.mrrContribution += monthly;
      } else {
        planAgg.set(key, {
          planSlug: sub.plan.slug,
          planName: sub.plan.name,
          count: 1,
          mrrContribution: monthly,
        });
      }
    }

    const mrrByPlan = Array.from(planAgg.values())
      .map((row) => ({
        ...row,
        mrrContribution: Math.round(row.mrrContribution * 100) / 100,
      }))
      .sort((a, b) => b.mrrContribution - a.mrrContribution);

    const [
      activeTenants,
      trialingTenants,
      cancelledLast30Days,
      totalActiveSubs,
      activationSampleTenants,
      totalPatients,
      totalProducts,
      salesThisMonth,
    ] = await Promise.all([
      this.prisma.tenant.count({ where: { status: 'active' } }),
      this.prisma.subscription.count({ where: { status: 'trial' } }),
      this.prisma.subscription.count({
        where: { cancelledAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.subscription.count({
        where: { status: { in: ['active', 'trial'] } },
      }),
      this.prisma.tenant.findMany({
        where: { createdAt: { lte: sevenDaysAgo } },
        select: {
          id: true,
          _count: {
            select: { patients: true, products: true, appointments: true },
          },
        },
      }),
      this.prisma.patient.count(),
      this.prisma.product.count(),
      this.prisma.sale.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    const sample = activationSampleTenants.length;
    const activated = activationSampleTenants.filter(
      (t) =>
        t._count.patients > 0 &&
        t._count.products > 0 &&
        t._count.appointments > 0,
    ).length;
    const activationRatePct = sample > 0 ? (activated / sample) * 100 : 0;

    // Churn rate aproximado: cancelados en últimos 30d / (activos + cancelados en ventana).
    // Sin histórico detallado usamos el total actual como denominador.
    const churnDenominator = totalActiveSubs + cancelledLast30Days;
    const churnRatePct =
      churnDenominator > 0 ? (cancelledLast30Days / churnDenominator) * 100 : 0;

    const roundedMrr = Math.round(mrr * 100) / 100;

    return {
      mrr: roundedMrr,
      arr: Math.round(roundedMrr * 12 * 100) / 100,
      activeTenants,
      activeSubscriptions: totalActiveSubs,
      trialingTenants,
      mrrByPlan,
      churn: {
        cancelledLast30Days,
        churnRatePct: Math.round(churnRatePct * 100) / 100,
      },
      activation: {
        sample,
        activated,
        ratePct: Math.round(activationRatePct * 100) / 100,
      },
      totals: {
        patients: totalPatients,
        products: totalProducts,
        salesThisMonth,
      },
    };
  }

  // ─── STATS ────────────────────────────────────────────────────────────────

  async getStats() {
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      cancelledTenants,
      activeSubscriptions,
      totalUsers,
      totalPatients,
      newTenantsThisMonth,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'active' } }),
      this.prisma.tenant.count({ where: { status: 'suspended' } }),
      this.prisma.tenant.count({ where: { status: 'cancelled' } }),
      this.prisma.subscription.findMany({
        where: { status: 'active' },
        include: { plan: { select: { price: true, currency: true } } },
      }),
      this.prisma.user.count(),
      this.prisma.patient.count(),
      this.prisma.tenant.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const mrr = activeSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.plan.price),
      0,
    );

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        suspended: suspendedTenants,
        cancelled: cancelledTenants,
        newThisMonth: newTenantsThisMonth,
      },
      subscriptions: {
        active: activeSubscriptions.length,
        mrr,
        currency: 'BOB',
      },
      users: {
        total: totalUsers,
      },
      patients: {
        total: totalPatients,
      },
    };
  }
}
