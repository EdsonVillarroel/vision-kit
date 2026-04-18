import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_ID_KEY } from './tenant.constants';
import { QUOTA_METADATA_KEY, QuotaResource } from './quota-limit.decorator';

// `-1` en el plan = sin límite. Cualquier otro entero es el tope.
const UNLIMITED = -1;

// Guard que aplica límites del plan antes de crear recursos.
// Se activa solo en handlers marcados con @QuotaLimit(resource).
// Devuelve 402 Payment Required con payload accionable cuando se excede.
@Injectable()
export class PlanQuotaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<QuotaResource | undefined>(
      QUOTA_METADATA_KEY,
      ctx.getHandler(),
    );
    if (!resource) return true;

    const tenantId = this.cls.get<string | undefined>(TENANT_ID_KEY);
    if (!tenantId) return true;

    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['active', 'trial'] } },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });

    if (!subscription) {
      throw new HttpException(
        'No se encontró una suscripción activa para este tenant.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const { plan } = subscription;
    const limit = this.getLimit(plan, resource);
    if (limit === UNLIMITED) return true;

    const current = await this.getCount(tenantId, resource);
    if (current >= limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'PlanQuotaExceeded',
          resource,
          current,
          limit,
          planSlug: plan.slug,
          planName: plan.name,
          message: `Alcanzaste el límite de ${limit} del plan ${plan.name}. Actualizá tu plan para continuar.`,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }

  private getLimit(
    plan: { maxUsers: number; maxPatients: number; maxProducts: number; features: unknown },
    resource: QuotaResource,
  ): number {
    switch (resource) {
      case 'patients':
        return plan.maxPatients;
      case 'products':
        return plan.maxProducts;
      case 'users':
        return plan.maxUsers;
      case 'sales_per_month': {
        const features = (plan.features ?? {}) as Record<string, unknown>;
        const value = features.max_sales_per_month;
        return typeof value === 'number' ? value : UNLIMITED;
      }
    }
  }

  private getCount(tenantId: string, resource: QuotaResource): Promise<number> {
    switch (resource) {
      case 'patients':
        return this.prisma.patient.count({ where: { tenantId } });
      case 'products':
        return this.prisma.product.count({ where: { tenantId } });
      case 'users':
        return this.prisma.user.count({ where: { tenantId } });
      case 'sales_per_month': {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        return this.prisma.sale.count({
          where: { tenantId, createdAt: { gte: startOfMonth } },
        });
      }
    }
  }
}
