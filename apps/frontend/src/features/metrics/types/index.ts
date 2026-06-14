export interface SalesMetrics {
  range: { from: string; to: string };
  totals: {
    salesCount: number;
    grossRevenue: number;
    avgTicket: number;
    refundRate: number;
  };
  byDay: { date: string; total: number; count: number }[];
  byPaymentMethod: { method: string; total: number; count: number }[];
  topSellers: { userId: string; name: string; total: number; count: number }[];
  byCategory: { category: string; total: number; count: number }[];
}

export interface MetricsQuery {
  from?: string;
  to?: string;
}
