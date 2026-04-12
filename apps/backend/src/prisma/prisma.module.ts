import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  // TenantPrismaService se exporta desde TenantModule (también @Global)
  exports: [PrismaService],
})
export class PrismaModule {}
