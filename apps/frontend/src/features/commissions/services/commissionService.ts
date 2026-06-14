import { api } from '../../../lib/api';
import type {
  CommissionReportRow,
  CommissionsQuery,
  LeaderboardQuery,
  LeaderboardRow,
  UserCommissionSummary,
} from '../types';

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

interface BackendCommissionReportRow {
  userId: string;
  name: string;
  commissionRate: number | string;
  salesCount: number;
  grossBase: number | string;
  commissionAmount: number | string;
}

interface BackendLeaderboardRow {
  userId: string;
  name: string;
  salesCount: number;
  totalSold: number | string;
}

interface BackendUserCommissionSummary {
  user: { id: string; name: string; commissionRate: number | string };
  range: { from: string; to: string };
  totals: {
    salesCount: number;
    grossBase: number | string;
    commissionAmount: number | string;
  };
  sales: Array<{
    id: string;
    saleNumber: string;
    date: string;
    subtotal: number | string;
    discount: number | string;
    base: number | string;
    commission: number | string;
  }>;
}

function mapReportRow(b: BackendCommissionReportRow): CommissionReportRow {
  return {
    userId: b.userId,
    name: b.name,
    commissionRate: Number(b.commissionRate),
    salesCount: Number(b.salesCount),
    grossBase: Number(b.grossBase),
    commissionAmount: Number(b.commissionAmount),
  };
}

function mapLeaderboardRow(b: BackendLeaderboardRow): LeaderboardRow {
  return {
    userId: b.userId,
    name: b.name,
    salesCount: Number(b.salesCount),
    totalSold: Number(b.totalSold),
  };
}

function mapSummary(b: BackendUserCommissionSummary): UserCommissionSummary {
  return {
    user: {
      id: b.user.id,
      name: b.user.name,
      commissionRate: Number(b.user.commissionRate),
    },
    range: b.range,
    totals: {
      salesCount: Number(b.totals.salesCount),
      grossBase: Number(b.totals.grossBase),
      commissionAmount: Number(b.totals.commissionAmount),
    },
    sales: b.sales.map((s) => ({
      id: s.id,
      saleNumber: s.saleNumber,
      date: s.date,
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      base: Number(s.base),
      commission: Number(s.commission),
    })),
  };
}

export const commissionService = {
  getReport: async (q: CommissionsQuery = {}): Promise<CommissionReportRow[]> => {
    const qs = buildQueryString({ from: q.from, to: q.to, userId: q.userId });
    const data = await api.get<BackendCommissionReportRow[]>(`/commissions${qs}`);
    return data.map(mapReportRow);
  },

  getLeaderboard: async (q: LeaderboardQuery = {}): Promise<LeaderboardRow[]> => {
    const qs = buildQueryString({ from: q.from, to: q.to, limit: q.limit });
    const data = await api.get<BackendLeaderboardRow[]>(`/commissions/leaderboard${qs}`);
    return data.map(mapLeaderboardRow);
  },

  getUserSummary: async (
    userId: string,
    q: Omit<CommissionsQuery, 'userId'> = {},
  ): Promise<UserCommissionSummary> => {
    const qs = buildQueryString({ from: q.from, to: q.to });
    const data = await api.get<BackendUserCommissionSummary>(
      `/commissions/summary/${userId}${qs}`,
    );
    return mapSummary(data);
  },
};
