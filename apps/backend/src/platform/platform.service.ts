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
