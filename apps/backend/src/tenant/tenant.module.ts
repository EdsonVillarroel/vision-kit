import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { TenantClsMiddleware } from './tenant-cls.middleware';
import { TenantGuard } from './tenant.guard';
import { TenantPrismaService } from './tenant-prisma.service';
import { SubscriptionGuard } from './subscription.guard';

@Global()
@Module({
  imports: [ClsModule],
  providers: [TenantClsMiddleware, TenantGuard, TenantPrismaService, SubscriptionGuard],
  exports: [TenantClsMiddleware, TenantGuard, TenantPrismaService, SubscriptionGuard],
})
export class TenantModule {}
