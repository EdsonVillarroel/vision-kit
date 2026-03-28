import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

const SALE_INCLUDE = {
  patient: { select: { id: true, firstName: true, lastName: true } },
  soldBy: { select: { id: true, name: true } },
  items: true,
  payments: true,
};

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private generateNumber() {
    return `VTA-${Date.now()}`;
  }

  async findAll(status?: SaleStatus, patientId?: string, from?: string, to?: string) {
    return this.prisma.sale.findMany({
      where: {
        status,
        patientId,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: SALE_INCLUDE,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: SALE_INCLUDE,
    });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada`);
    return sale;
  }

  async create(dto: CreateSaleDto, soldById: string) {
    const products = await Promise.all(
      dto.items.map((item) =>
        this.prisma.product.findUnique({ where: { id: item.productId } }),
      ),
    );

    const saleItems = dto.items.map((item, i) => {
      const product = products[i];
      if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
      const subtotal = item.unitPrice * item.quantity;
      const discountAmt = subtotal * ((item.discount ?? 0) / 100);
      return {
        productId: item.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount ?? 0,
        subtotal,
        total: subtotal - discountAmt,
      };
    });

    const subtotal = saleItems.reduce((s, i) => s + i.subtotal, 0);
    const discountAmt = subtotal * ((dto.discount ?? 0) / 100);
    const taxableBase = subtotal - discountAmt;
    const total = taxableBase + taxableBase * dto.tax;

    return this.prisma.sale.create({
      data: {
        saleNumber: this.generateNumber(),
        patientId: dto.patientId,
        soldById,
        medicalRecordId: dto.medicalRecordId,
        date: new Date(dto.date),
        subtotal,
        discount: dto.discount ?? 0,
        tax: taxableBase * dto.tax,
        total,
        paymentMethod: dto.paymentMethod,
        prescriptionRequired: dto.prescriptionRequired ?? false,
        notes: dto.notes,
        warrantyExpiryDate: dto.warrantyExpiryDate ? new Date(dto.warrantyExpiryDate) : null,
        warrantyTerms: dto.warrantyTerms,
        items: { create: saleItems },
        payments: dto.payments ? { create: dto.payments } : undefined,
      },
      include: SALE_INCLUDE,
    });
  }

  async updateStatus(id: string, status: SaleStatus, reason?: string) {
    await this.findOne(id);
    return this.prisma.sale.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined,
        cancelledAt: status === 'cancelled' ? new Date() : undefined,
        refundedAt: status === 'refunded' ? new Date() : undefined,
        notes: reason,
      },
      include: SALE_INCLUDE,
    });
  }

  async getSummary(from: string, to: string) {
    const sales = await this.prisma.sale.findMany({
      where: {
        status: 'completed',
        date: { gte: new Date(from), lte: new Date(to) },
      },
      include: { items: true, payments: true },
    });

    const totalRevenue = sales.reduce((s, sale) => s + Number(sale.total), 0);

    return {
      totalSales: sales.length,
      totalRevenue,
      averageTicket: sales.length ? totalRevenue / sales.length : 0,
    };
  }
}
