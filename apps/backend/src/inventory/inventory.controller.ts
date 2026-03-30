import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductCategory, ProductStatus } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('inventory')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @ApiOperation({ summary: 'Listar productos con filtros' })
  @ApiQuery({ name: 'category', required: false, enum: ProductCategory })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Query('category') category?: ProductCategory,
    @Query('status') status?: ProductStatus,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(category, status, search);
  }

  @ApiOperation({ summary: 'Productos con stock bajo o agotado' })
  @Get('alerts')
  getLowStock() {
    return this.service.getLowStock();
  }

  @ApiOperation({ summary: 'Obtener producto por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Movimientos de stock de un producto' })
  @Get(':id/movements')
  getMovements(@Param('id') id: string) {
    return this.service.getMovements(id);
  }

  @ApiOperation({ summary: 'Crear producto — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar producto — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Ajustar stock (in/out/adjustment) — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Post(':id/adjust')
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto, @Req() req: any) {
    return this.service.adjustStock(id, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Eliminar producto — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
