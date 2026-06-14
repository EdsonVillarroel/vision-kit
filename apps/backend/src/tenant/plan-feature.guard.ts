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
import { PLAN_FEATURE_KEY } from './plan-feature.decorator';

// Guard booleano que verifica que el plan de la suscripción activa del tenant
// tenga `features[featureKey] === true`. Se activa solo en handlers/controllers
// marcados con @PlanFeature('algo').
//
// Devuelve 402 Payment Required con cuerpo accionable cuando falta el flag:
// { error: 'FeatureNotInPlan', feature, planSlug, planName, message }.
// Rutas sin tenantId en CLS (public/platform) pasan sin verificación.
@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // Soporta decorator a nivel de clase o método. Precedencia: método > clase.
    const feature =
      this.reflector.get<string | undefined>(PLAN_FEATURE_KEY, ctx.getHandler()) ??
      this.reflector.get<string | undefined>(PLAN_FEATURE_KEY, ctx.getClass());
    if (!feature) return true;

    const tenantId = this.cls.get<string | undefined>(TENANT_ID_KEY);
    if (!tenantId) return true;

    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['active', 'trial'] } },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });

    if (!subscription) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'FeatureNotInPlan',
          feature,
          planSlug: null,
          planName: null,
          message: 'No se encontró una suscripción activa para este tenant.',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const { plan } = subscription;
    const features = (plan.features ?? {}) as Record<string, unknown>;
    if (features[feature] === true) return true;

    throw new HttpException(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'FeatureNotInPlan',
        feature,
        planSlug: plan.slug,
        planName: plan.name,
        message: `Esta funcionalidad (${feature}) no está incluida en tu plan ${plan.name}. Actualizá tu plan para acceder.`,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
