import { Injectable, NotFoundException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_ID_KEY } from '../tenant/tenant.constants';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  async getCurrent() {
    const tenantId = this.cls.get<string>(TENANT_ID_KEY);

    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['active', 'trial'] } },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('No se encontró una suscripción activa');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [patients, products, users, salesThisMonth] = await Promise.all([
      this.prisma.patient.count({ where: { tenantId } }),
      this.prisma.product.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.sale.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
    ]);

    const features = (subscription.plan.features ?? {}) as Record<string, unknown>;
    const maxSalesPerMonth =
      typeof features.max_sales_per_month === 'number' ? features.max_sales_per_month : -1;

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt,
      },
      plan: {
        id: subscription.plan.id,
        slug: subscription.plan.slug,
        name: subscription.plan.name,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        billingPeriod: subscription.plan.billingPeriod,
        features: subscription.plan.features,
      },
      limits: {
        patients: subscription.plan.maxPatients,
        products: subscription.plan.maxProducts,
        users: subscription.plan.maxUsers,
        storageMb: subscription.plan.maxStorageMb,
        salesPerMonth: maxSalesPerMonth,
      },
      usage: {
        patients,
        products,
        users,
        salesThisMonth,
      },
    };
  }
}
