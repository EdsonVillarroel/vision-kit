import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../../../components/ui';
import type { SalesMetrics } from '../types';
import { formatBs, getChartColors } from './chartTheme';

interface Props {
  data: SalesMetrics['topSellers'];
}

const TooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SalesMetrics['topSellers'][number]; value: number }>;
}) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-white border border-theme-divider rounded-lg shadow-lg px-3 py-2">
      <p className="font-semibold text-theme-dark-primary">{row.name}</p>
      <p className="text-sm">{formatBs(row.total)}</p>
      <p className="text-xs text-theme-secondary-text">{row.count} venta{row.count === 1 ? '' : 's'}</p>
    </div>
  );
};

export const TopSellersChart: React.FC<Props> = ({ data }) => {
  const { primary } = useMemo(() => getChartColors(), []);

  return (
    <Card elevation="low" className="!p-6">
      <h2 className="text-xl font-bold text-theme-dark-primary mb-4">Top vendedores</h2>
      {data.length === 0 ? (
        <p className="text-center text-theme-secondary-text py-16">Sin vendedores en el rango</p>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                width={110}
              />
              <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }} />
              <Bar dataKey="total" fill={primary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
