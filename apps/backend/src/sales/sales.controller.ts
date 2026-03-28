import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SaleStatus } from '@prisma/client';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private service: SalesService) {}

  // GET /api/v1/sales?status=&patientId=&from=&to=
  @Get()
  findAll(
    @Query('status') status?: SaleStatus,
    @Query('patientId') patientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findAll(status, patientId, from, to);
  }

  // GET /api/v1/sales/summary?from=&to=
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Get('summary')
  getSummary(@Query('from') from: string, @Query('to') to: string) {
    return this.service.getSummary(from, to);
  }

  // GET /api/v1/sales/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // POST /api/v1/sales
  @Post()
  create(@Body() dto: CreateSaleDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  // PATCH /api/v1/sales/:id/status
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SaleStatus; reason?: string },
  ) {
    return this.service.updateStatus(id, body.status, body.reason);
  }
}
