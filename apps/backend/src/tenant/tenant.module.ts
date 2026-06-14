import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { TenantClsMiddleware } from './tenant-cls.middleware';
import { TenantGuard } from './tenant.guard';
import { TenantPrismaService } from './tenant-prisma.service';
import { SubscriptionGuard } from './subscription.guard';
import { PlanQuotaGuard } from './plan-quota.guard';
import { PlanFeatureGuard } from './plan-feature.guard';

@Global()
@Module({
  imports: [ClsModule],
  providers: [
    TenantClsMiddleware,
    TenantGuard,
    TenantPrismaService,
    SubscriptionGuard,
    PlanQuotaGuard,
    PlanFeatureGuard,
  ],
  exports: [
    TenantClsMiddleware,
    TenantGuard,
    TenantPrismaService,
    SubscriptionGuard,
    PlanQuotaGuard,
    PlanFeatureGuard,
  ],
})
export class TenantModule {}
