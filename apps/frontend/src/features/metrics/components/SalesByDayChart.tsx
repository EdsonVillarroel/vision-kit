import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../../../components/ui';
import type { SalesMetrics } from '../types';
import { formatBs, getChartColors } from './chartTheme';

interface Props {
  data: SalesMetrics['byDay'];
}

const formatShortDate = (iso: string): string => {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
};

const TooltipContent = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { count: number; date: string } }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  const { value, payload: row } = payload[0];
  return (
    <div className="bg-white border border-theme-divider rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-theme-secondary-text">{label}</p>
      <p className="font-semibold text-theme-dark-primary">{formatBs(value)}</p>
      <p className="text-xs text-theme-secondary-text">{row.count} venta{row.count === 1 ? '' : 's'}</p>
    </div>
  );
};

export const SalesByDayChart: React.FC<Props> = ({ data }) => {
  const { primary } = useMemo(() => getChartColors(), []);

  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  return (
    <Card elevation="low" className="!p-6">
      <h2 className="text-xl font-bold text-theme-dark-primary mb-4">Ventas por día</h2>
      {chartData.length === 0 ? (
        <p className="text-center text-theme-secondary-text py-16">Sin datos en el rango</p>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              />
              <Tooltip content={<TooltipContent />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke={primary}
                strokeWidth={2.5}
                dot={{ r: 3, fill: primary }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
