import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

/**
 * Resolve a date range with defaults: últimos 30 días (hoy - 30d → hoy).
 * Valida que from <= to.
 */
function resolveRange(from?: string, to?: string): { from: Date; to: Date } {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from
    ? new Date(from)
    : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new BadRequestException('Fechas inválidas');
  }
  if (fromDate.getTime() > toDate.getTime()) {
    throw new BadRequestException('`from` debe ser menor o igual a `to`');
  }
  return { from: fromDate, to: toDate };
}

@Injectable()
export class CommissionsService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  /**
   * Reporte de comisiones por vendedor en un rango.
   * grossBase = Σ (subtotal - discount) de ventas `completed`.
   * commissionAmount = grossBase × commissionRate / 100.
   */
  async getReport(query: QueryCommissionsDto) {
    const { from, to } = resolveRange(query.from, query.to);

    const grouped = await this.tenantPrisma.client.sale.groupBy({
      by: ['soldById'],
      where: {
        status: 'completed',
        date: { gte: from, lte: to },
        ...(query.userId ? { soldById: query.userId } : {}),
      },
      _count: { _all: true },
      _sum: { subtotal: true, discount: true },
    });

    if (grouped.length === 0) return [];

    const userIds = grouped.map((g) => g.soldById);
    const users = await this.tenantPrisma.client.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, commissionRate: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const report = grouped.map((g) => {
      const user = userMap.get(g.soldById);
      const commissionRate = user ? Number(user.commissionRate) : 0;
      const subtotalSum = g._sum.subtotal ? Number(g._sum.subtotal) : 0;
      const discountSum = g._sum.discount ? Number(g._sum.discount) : 0;
      const grossBase = subtotalSum - discountSum;
      const commissionAmount = (grossBase * commissionRate) / 100;

      return {
        userId: g.soldById,
        name: user?.name ?? 'Usuario desconocido',
        commissionRate,
        salesCount: g._count._all,
        grossBase,
        commissionAmount,
      };
    });

    report.sort((a, b) => b.commissionAmount - a.commissionAmount);
    return report;
  }

  /**
   * Top vendedores por monto total vendido (sum de sales.total, status completed).
   * No incluye commissionAmount — es un ranking de ventas brutas.
   */
  async getLeaderboard(query: LeaderboardQueryDto) {
    const { from, to } = resolveRange(query.from, query.to);
    const limit = query.limit ?? 10;

    const grouped = await this.tenantPrisma.client.sale.groupBy({
      by: ['soldById'],
      where: {
        status: 'completed',
        date: { gte: from, lte: to },
      },
      _count: { _all: true },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    const userIds = grouped.map((g) => g.soldById);
    const users = await this.tenantPrisma.client.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return grouped.map((g) => ({
      userId: g.soldById,
      name: userMap.get(g.soldById)?.name ?? 'Usuario desconocido',
      salesCount: g._count._all,
      totalSold: g._sum.total ? Number(g._sum.total) : 0,
    }));
  }

  /**
   * Detalle de ventas y comisiones de un vendedor específico.
   */
  async getUserSummary(userId: string, query: { from?: string; to?: string }) {
    const { from, to } = resolveRange(query.from, query.to);

    const user = await this.tenantPrisma.client.user.findFirst({
      where: { id: userId },
      select: { id: true, name: true, commissionRate: true },
    });
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`);
    }

    const commissionRate = Number(user.commissionRate);

    const sales = await this.tenantPrisma.client.sale.findMany({
      where: {
        soldById: userId,
        status: 'completed',
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        saleNumber: true,
        date: true,
        subtotal: true,
        discount: true,
      },
    });

    const saleRows = sales.map((s) => {
      const subtotal = Number(s.subtotal);
      const discount = Number(s.discount);
      const base = subtotal - discount;
      const commission = (base * commissionRate) / 100;
      return {
        id: s.id,
        saleNumber: s.saleNumber,
        date: s.date,
        subtotal,
        discount,
        base,
        commission,
      };
    });

    const grossBase = saleRows.reduce((s, r) => s + r.base, 0);
    const commissionAmount = saleRows.reduce((s, r) => s + r.commission, 0);

    return {
      user: {
        id: user.id,
        name: user.name,
        commissionRate,
      },
      range: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      },
      totals: {
        salesCount: saleRows.length,
        grossBase,
        commissionAmount,
      },
      sales: saleRows,
    };
  }
}
