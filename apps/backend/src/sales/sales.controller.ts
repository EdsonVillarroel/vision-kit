import {
  Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('sales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private service: SalesService) {}

  @ApiOperation({ summary: 'Listar ventas con filtros' })
  @ApiQuery({ name: 'status', required: false, enum: SaleStatus })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'from', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-12-31' })
  @Get()
  findAll(
    @Query('status') status?: SaleStatus,
    @Query('patientId') patientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findAll(status, patientId, from, to);
  }

  @ApiOperation({ summary: 'Resumen de ventas por período — roles: admin, manager' })
  @ApiQuery({ name: 'from', required: true, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-12-31' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Get('summary')
  getSummary(@Query('from') from: string, @Query('to') to: string) {
    return this.service.getSummary(from, to);
  }

  @ApiOperation({ summary: 'Obtener venta por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Crear venta' })
  @Post()
  create(@Body() dto: CreateSaleDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Actualizar estado de venta (completed/cancelled/refunded)' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SaleStatus; reason?: string },
    @Req() req: any,
  ) {
    return this.service.updateStatus(id, body.status, req.user.id, body.reason);
  }
}
