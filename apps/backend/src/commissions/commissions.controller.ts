import {
  Controller, Get, Query, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlanFeatureGuard } from '../tenant/plan-feature.guard';
import { PlanFeature } from '../tenant/plan-feature.decorator';

@ApiTags('commissions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, PlanFeatureGuard)
@Roles('admin', 'super_admin')
@PlanFeature('commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private service: CommissionsService) {}

  @ApiOperation({ summary: 'Reporte de comisiones por vendedor en un rango — roles: admin, super_admin' })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01', description: 'YYYY-MM-DD. Default: hoy - 30d' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31', description: 'YYYY-MM-DD. Default: hoy' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por un vendedor específico' })
  @ApiResponse({
    status: 200,
    description: 'Listado por vendedor: { userId, name, commissionRate, salesCount, grossBase, commissionAmount }',
  })
  @Get()
  getReport(@Query() q: QueryCommissionsDto) {
    return this.service.getReport(q);
  }

  @ApiOperation({ summary: 'Top vendedores por monto total vendido — roles: admin, super_admin' })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Máximo 50' })
  @ApiResponse({
    status: 200,
    description: 'Ranking: { userId, name, salesCount, totalSold } ordenado por totalSold desc',
  })
  @Get('leaderboard')
  getLeaderboard(@Query() q: LeaderboardQueryDto) {
    return this.service.getLeaderboard(q);
  }

  @ApiOperation({ summary: 'Detalle de ventas y comisiones de un vendedor — roles: admin, super_admin' })
  @ApiParam({ name: 'userId', description: 'ID del vendedor (UUID)' })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31' })
  @ApiResponse({ status: 200, description: 'Resumen con totales y listado de ventas del vendedor' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get('summary/:userId')
  getUserSummary(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() q: QueryCommissionsDto,
  ) {
    return this.service.getUserSummary(userId, { from: q.from, to: q.to });
  }
}
