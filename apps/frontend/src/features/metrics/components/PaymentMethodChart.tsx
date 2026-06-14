import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../../../components/ui';
import type { SalesMetrics } from '../types';
import { formatBs, CATEGORICAL_PALETTE } from './chartTheme';

interface Props {
  data: SalesMetrics['byPaymentMethod'];
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  check: 'Cheque',
  mixed: 'Mixto',
};

const translateMethod = (method: string): string => METHOD_LABELS[method] ?? method;

const TooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; total: number; count: number } }>;
}) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-white border border-theme-divider rounded-lg shadow-lg px-3 py-2">
      <p className="font-semibold text-theme-dark-primary">{row.label}</p>
      <p className="text-sm">{formatBs(row.total)}</p>
      <p className="text-xs text-theme-secondary-text">{row.count} venta{row.count === 1 ? '' : 's'}</p>
    </div>
  );
};

export const PaymentMethodChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((d) => ({ ...d, label: translateMethod(d.method) }));

  return (
    <Card elevation="low" className="!p-6">
      <h2 className="text-xl font-bold text-theme-dark-primary mb-4">Métodos de pago</h2>
      {chartData.length === 0 ? (
        <p className="text-center text-theme-secondary-text py-16">Sin pagos en el rango</p>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
              >
                {chartData.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={CATEGORICAL_PALETTE[idx % CATEGORICAL_PALETTE.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<TooltipContent />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
