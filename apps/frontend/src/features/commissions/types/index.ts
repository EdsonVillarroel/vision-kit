export interface CommissionReportRow {
  userId: string;
  name: string;
  commissionRate: number;
  salesCount: number;
  grossBase: number;
  commissionAmount: number;
}

export interface LeaderboardRow {
  userId: string;
  name: string;
  salesCount: number;
  totalSold: number;
}

export interface CommissionSaleDetail {
  id: string;
  saleNumber: string;
  date: string;
  subtotal: number;
  discount: number;
  base: number;
  commission: number;
}

export interface UserCommissionSummary {
  user: { id: string; name: string; commissionRate: number };
  range: { from: string; to: string };
  totals: { salesCount: number; grossBase: number; commissionAmount: number };
  sales: CommissionSaleDetail[];
}

export interface CommissionsQuery {
  from?: string; // YYYY-MM-DD
  to?: string;
  userId?: string;
}

export interface LeaderboardQuery {
  from?: string;
  to?: string;
  limit?: number;
}

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}
