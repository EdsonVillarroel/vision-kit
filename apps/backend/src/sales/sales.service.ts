import { Injectable, NotFoundException } from '@nestjs/common';
import { SaleStatus } from '@prisma/client';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesMetricsQueryDto } from './dto/sales-metrics-query.dto';

const SALE_INCLUDE = {
  patient: { select: { id: true, firstName: true, lastName: true } },
  soldBy: { select: { id: true, name: true } },
  items: true,
  payments: true,
};

@Injectable()
export class SalesService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  private generateNumber() {
    return `VTA-${Date.now()}`;
  }

  async findAll(status?: SaleStatus, patientId?: string, from?: string, to?: string) {
    return this.tenantPrisma.client.sale.findMany({
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
    const sale = await this.tenantPrisma.client.sale.findFirst({
      where: { id },
      include: SALE_INCLUDE,
    });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada`);
    return sale;
  }

  async create(dto: CreateSaleDto, soldById: string) {
    const products = await Promise.all(
      dto.items.map((item) =>
        this.tenantPrisma.client.product.findFirst({ where: { id: item.productId } }),
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

    const sale = await this.tenantPrisma.client.sale.create({
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

    // Descontar stock por cada ítem vendido
    await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.tenantPrisma.client.product.findFirst({ where: { id: item.productId } });
        if (!product) return;
        const newStock = Math.max(0, product.stock - item.quantity);
        const status =
          newStock === 0 ? 'out_of_stock'
          : newStock <= product.minStock ? 'low_stock'
          : 'in_stock';
        await this.tenantPrisma.client.product.update({
          where: { id: item.productId },
          data: { stock: newStock, status },
        });
        await this.tenantPrisma.client.stockMovement.create({
          data: {
            productId: item.productId,
            performedById: soldById,
            type: 'out',
            quantity: item.quantity,
            previousStock: product.stock,
            newStock,
            reason: 'Venta',
            reference: sale.saleNumber,
            date: new Date(),
          },
        });
      }),
    );

    // Actualizar visitCount y totalSpent del paciente
    await this.tenantPrisma.client.patient.update({
      where: { id: dto.patientId },
      data: {
        visitCount: { increment: 1 },
        totalSpent: { increment: total },
      },
    });

    return sale;
  }

  async updateStatus(id: string, status: SaleStatus, performedById: string, reason?: string) {
    const sale = await this.findOne(id);

    const updated = await this.tenantPrisma.client.sale.update({
      where: { id },
      data: {
        status,
        cancellationReason: reason,
        completedAt: status === 'completed' ? new Date() : undefined,
        cancelledAt: status === 'cancelled' ? new Date() : undefined,
        refundedAt: status === 'refunded' ? new Date() : undefined,
      },
      include: SALE_INCLUDE,
    });

    // Revertir stock al cancelar o reembolsar (solo si venía de pending o completed)
    if (
      (status === 'cancelled' || status === 'refunded') &&
      (sale.status === 'pending' || sale.status === 'completed')
    ) {
      const saleWithItems = await this.tenantPrisma.client.sale.findFirst({
        where: { id },
        include: { items: true },
      });

      await Promise.all(
        (saleWithItems?.items ?? []).map(async (item) => {
          const product = await this.tenantPrisma.client.product.findFirst({ where: { id: item.productId } });
          if (!product) return;
          const newStock = product.stock + item.quantity;
          const productStatus =
            newStock === 0 ? 'out_of_stock'
            : newStock <= product.minStock ? 'low_stock'
            : 'in_stock';
          await this.tenantPrisma.client.product.update({
            where: { id: item.productId },
            data: { stock: newStock, status: productStatus },
          });
          await this.tenantPrisma.client.stockMovement.create({
            data: {
              productId: item.productId,
              performedById,
              type: 'in',
              quantity: item.quantity,
              previousStock: product.stock,
              newStock,
              reason: status === 'cancelled' ? 'Cancelación de venta' : 'Reembolso de venta',
              reference: sale.saleNumber,
              date: new Date(),
            },
          });
        }),
      );

      // Revertir visitCount y totalSpent del paciente
      await this.tenantPrisma.client.patient.update({
        where: { id: sale.patientId },
        data: {
          visitCount: { decrement: 1 },
          totalSpent: { decrement: Number(sale.total) },
        },
      });
    }

    return updated;
  }

  async getSummary(from: string, to: string) {
    const sales = await this.tenantPrisma.client.sale.findMany({
      where: {
        status: 'completed',
        date: { gte: new Date(from), lte: new Date(to) },
      },
      include: { items: true, payments: true },
    });

    const totalRevenue = sales.reduce((s, sale) => s + Number(sale.total), 0);

    // Top products by quantity sold
    const productMap = new Map<string, { productId: string; productName: string; quantitySold: number; revenue: number }>();
    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.revenue += Number(item.total);
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantitySold: item.quantity,
            revenue: Number(item.total),
          });
        }
      }
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // Sales by payment method
    const methodMap = new Map<string, { method: string; count: number; amount: number }>();
    for (const sale of sales) {
      const method = sale.paymentMethod;
      const existing = methodMap.get(method);
      if (existing) {
        existing.count += 1;
        existing.amount += Number(sale.total);
      } else {
        methodMap.set(method, { method, count: 1, amount: Number(sale.total) });
      }
    }
    const salesByMethod = Array.from(methodMap.values());

    // Sales by day
    const dayMap = new Map<string, { date: string; count: number; amount: number }>();
    for (const sale of sales) {
      const date = sale.date instanceof Date
        ? sale.date.toISOString().split('T')[0]
        : String(sale.date).split('T')[0];
      const existing = dayMap.get(date);
      if (existing) {
        existing.count += 1;
        existing.amount += Number(sale.total);
      } else {
        dayMap.set(date, { date, count: 1, amount: Number(sale.total) });
      }
    }
    const salesByDay = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSales: sales.length,
      totalRevenue,
      averageTicket: sales.length ? totalRevenue / sales.length : 0,
      topProducts,
      salesByMethod,
      salesByDay,
    };
  }

  async getMetrics(query: SalesMetricsQueryDto) {
    // ── Rango por defecto: últimos 30 días ───────────────────────────────────
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const defaultFrom = new Date(today);
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    defaultFrom.setHours(0, 0, 0, 0);

    const fromDate = query.from ? new Date(query.from) : defaultFrom;
    const toDate = query.to ? new Date(query.to) : today;

    // Normalizar extremos del rango para incluir días completos
    if (query.from) fromDate.setHours(0, 0, 0, 0);
    if (query.to) toDate.setHours(23, 59, 59, 999);

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = toDate.toISOString().split('T')[0];

    const dateRange = { gte: fromDate, lte: toDate };

    // ── Ventas completadas en el rango ───────────────────────────────────────
    const completedSales = await this.tenantPrisma.client.sale.findMany({
      where: { status: 'completed', date: dateRange },
      select: { id: true, date: true, total: true, paymentMethod: true, soldById: true },
    });

    // Refunded count para calcular tasa de reembolsos
    const refundedCount = await this.tenantPrisma.client.sale.count({
      where: { status: 'refunded', date: dateRange },
    });

    const completedCount = completedSales.length;
    const grossRevenue = completedSales.reduce((s, sale) => s + Number(sale.total), 0);
    const avgTicket = completedCount ? grossRevenue / completedCount : 0;
    const totalWithRefunds = completedCount + refundedCount;
    const refundRate = totalWithRefunds ? (refundedCount / totalWithRefunds) * 100 : 0;

    // ── byDay: agrupar en memoria por YYYY-MM-DD ─────────────────────────────
    const dayMap = new Map<string, { date: string; total: number; count: number }>();
    for (const sale of completedSales) {
      const dateKey =
        sale.date instanceof Date
          ? sale.date.toISOString().split('T')[0]
          : String(sale.date).split('T')[0];
      const existing = dayMap.get(dateKey);
      if (existing) {
        existing.total += Number(sale.total);
        existing.count += 1;
      } else {
        dayMap.set(dateKey, { date: dateKey, total: Number(sale.total), count: 1 });
      }
    }
    const byDay = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // ── byPaymentMethod: groupBy con _sum + _count ──────────────────────────
    const paymentGroups = await this.tenantPrisma.client.sale.groupBy({
      by: ['paymentMethod'],
      where: { status: 'completed', date: dateRange },
      _sum: { total: true },
      _count: { _all: true },
    });
    const byPaymentMethod = paymentGroups.map(
      (g: { paymentMethod: string; _sum: { total: unknown }; _count: { _all: number } }) => ({
        method: g.paymentMethod,
        total: Number(g._sum.total ?? 0),
        count: g._count._all,
      }),
    );

    // ── topSellers: groupBy por soldById + lookup de nombres ────────────────
    const sellerGroups = await this.tenantPrisma.client.sale.groupBy({
      by: ['soldById'],
      where: { status: 'completed', date: dateRange },
      _sum: { total: true },
      _count: { _all: true },
    });
    const sellerIds = sellerGroups.map((g: { soldById: string }) => g.soldById);
    const sellers = sellerIds.length
      ? await this.tenantPrisma.client.user.findMany({
          where: { id: { in: sellerIds } },
          select: { id: true, name: true },
        })
      : [];
    const sellerNameMap = new Map<string, string>(
      sellers.map((u: { id: string; name: string }) => [u.id, u.name]),
    );
    const topSellers = sellerGroups
      .map(
        (g: { soldById: string; _sum: { total: unknown }; _count: { _all: number } }) => ({
          userId: g.soldById,
          name: sellerNameMap.get(g.soldById) ?? 'Usuario',
          total: Number(g._sum.total ?? 0),
          count: g._count._all,
        }),
      )
      .sort((a: { total: number }, b: { total: number }) => b.total - a.total)
      .slice(0, 5);

    // ── byCategory: agregar desde sale_items + product.category ─────────────
    const saleItems = await this.tenantPrisma.client.saleItem.findMany({
      where: {
        sale: { status: 'completed', date: dateRange },
      },
      select: {
        total: true,
        saleId: true,
        product: { select: { category: true } },
      },
    });
    const categoryMap = new Map<string, { category: string; total: number; saleIds: Set<string> }>();
    for (const item of saleItems) {
      const category = item.product?.category ?? 'uncategorized';
      const existing = categoryMap.get(category);
      if (existing) {
        existing.total += Number(item.total);
        existing.saleIds.add(item.saleId);
      } else {
        categoryMap.set(category, {
          category,
          total: Number(item.total),
          saleIds: new Set([item.saleId]),
        });
      }
    }
    const byCategory = Array.from(categoryMap.values())
      .map((c) => ({ category: c.category, total: c.total, count: c.saleIds.size }))
      .sort((a, b) => b.total - a.total);

    return {
      range: { from: fromStr, to: toStr },
      totals: {
        salesCount: completedCount,
        grossRevenue,
        avgTicket,
        refundRate,
      },
      byDay,
      byPaymentMethod,
      topSellers,
      byCategory,
    };
  }
}
