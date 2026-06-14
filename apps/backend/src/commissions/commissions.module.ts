import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';

/**
 * TenantModule es @Global, por lo que TenantPrismaService ya está disponible
 * sin necesidad de importarlo explícitamente aquí.
 */
@Module({
  providers: [CommissionsService],
  controllers: [CommissionsController],
})
export class CommissionsModule {}
