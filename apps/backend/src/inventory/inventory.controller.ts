import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductCategory, ProductStatus } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  // GET /api/v1/inventory?category=&status=&search=
  @Get()
  findAll(
    @Query('category') category?: ProductCategory,
    @Query('status') status?: ProductStatus,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(category, status, search);
  }

  // GET /api/v1/inventory/alerts
  @Get('alerts')
  getLowStock() {
    return this.service.getLowStock();
  }

  // GET /api/v1/inventory/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // GET /api/v1/inventory/:id/movements
  @Get(':id/movements')
  getMovements(@Param('id') id: string) {
    return this.service.getMovements(id);
  }

  // POST /api/v1/inventory
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  // PATCH /api/v1/inventory/:id
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.service.update(id, dto);
  }

  // POST /api/v1/inventory/:id/adjust
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Post(':id/adjust')
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
    @Req() req: any,
  ) {
    return this.service.adjustStock(id, dto, req.user.id);
  }

  // DELETE /api/v1/inventory/:id
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
