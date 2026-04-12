import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductCategory, ProductStatus } from '@prisma/client';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

const PRODUCT_INCLUDE = { specifications: true, supplier: true };

@Injectable()
export class InventoryService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  async findAll(category?: ProductCategory, status?: ProductStatus, search?: string) {
    return this.tenantPrisma.client.product.findMany({
      where: {
        category,
        status,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: PRODUCT_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.tenantPrisma.client.product.findFirst({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  async getLowStock() {
    return this.tenantPrisma.client.product.findMany({
      where: {
        status: { in: ['low_stock', 'out_of_stock'] },
      },
      include: PRODUCT_INCLUDE,
      orderBy: { stock: 'asc' },
    });
  }

  async create(dto: CreateProductDto) {
    const { specifications, supplier, ...data } = dto;
    return this.tenantPrisma.client.product.create({
      data: {
        ...data,
        specifications: specifications ? { create: specifications } : undefined,
        supplier: supplier ? { create: supplier } : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    await this.findOne(id);
    const { specifications, supplier, ...data } = dto;
    return this.tenantPrisma.client.product.update({
      where: { id },
      data: {
        ...data,
        specifications: specifications
          ? { upsert: { create: specifications, update: specifications } }
          : undefined,
        supplier: supplier
          ? { upsert: { create: supplier, update: supplier } }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.tenantPrisma.client.product.delete({ where: { id } });
  }

  async adjustStock(id: string, dto: AdjustStockDto, performedById: string) {
    const product = await this.findOne(id);
    const previousStock = product.stock;
    let newStock: number;

    if (dto.type === 'in') newStock = previousStock + dto.quantity;
    else if (dto.type === 'out') newStock = Math.max(0, previousStock - dto.quantity);
    else newStock = dto.quantity;

    const status: ProductStatus =
      newStock === 0 ? 'out_of_stock'
      : newStock <= product.minStock ? 'low_stock'
      : 'in_stock';

    await this.tenantPrisma.client.product.update({
      where: { id },
      data: { stock: newStock, status },
    });

    return this.tenantPrisma.client.stockMovement.create({
      data: {
        productId: id,
        performedById,
        type: dto.type,
        quantity: dto.quantity,
        previousStock,
        newStock,
        reason: dto.reason,
        reference: dto.reference,
        notes: dto.notes,
        date: new Date(),
      },
    });
  }

  async getMovements(productId: string) {
    return this.tenantPrisma.client.stockMovement.findMany({
      where: { productId },
      include: { performedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
