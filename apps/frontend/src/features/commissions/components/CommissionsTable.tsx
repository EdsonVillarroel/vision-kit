import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui';
import type { CommissionReportRow } from '../types';

interface CommissionsTableProps {
  rows: CommissionReportRow[];
}

export const currencyFormatter = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatRate = (rate: number) => `${rate.toFixed(2)}%`;

export const CommissionsTable: React.FC<CommissionsTableProps> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-theme-light-primary/10 rounded-2xl shadow-lg p-12 border border-theme-divider/20 text-center">
        <svg
          className="w-16 h-16 text-theme-secondary-text opacity-50 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-theme-dark-primary mb-1">
          Sin datos en el rango
        </h3>
        <p className="text-theme-secondary-text">
          No hay ventas completadas en este rango.
        </p>
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => ({
      salesCount: acc.salesCount + r.salesCount,
      grossBase: acc.grossBase + r.grossBase,
      commissionAmount: acc.commissionAmount + r.commissionAmount,
    }),
    { salesCount: 0, grossBase: 0, commissionAmount: 0 },
  );

  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHead>Vendedor</TableHead>
          <TableHead align="right"># Ventas</TableHead>
          <TableHead align="right">Base (Bs)</TableHead>
          <TableHead align="right">%</TableHead>
          <TableHead align="right">Comisión (Bs)</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableEmpty colSpan={5} message="No se encontraron comisiones" />
        ) : (
          rows.map((row) => (
            <TableRow key={row.userId} interactive={false}>
              <TableCell>
                <span className="font-medium text-theme-dark-primary">
                  {row.name}
                </span>
              </TableCell>
              <TableCell align="right">
                <span className="text-theme-secondary-text">
                  {row.salesCount}
                </span>
              </TableCell>
              <TableCell align="right">
                <span className="font-mono">{formatCurrency(row.grossBase)}</span>
              </TableCell>
              <TableCell align="right">
                <span className="font-mono text-theme-secondary-text">
                  {formatRate(row.commissionRate)}
                </span>
              </TableCell>
              <TableCell align="right">
                <span className="font-mono font-bold text-theme-dark-primary">
                  {formatCurrency(row.commissionAmount)}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
      <tfoot className="bg-theme-light-primary/30 border-t-2 border-theme-primary/20">
        <tr>
          <td className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-theme-dark-primary">
            Totales
          </td>
          <td className="px-6 py-4 text-sm text-right font-bold text-theme-dark-primary">
            {totals.salesCount}
          </td>
          <td className="px-6 py-4 text-sm text-right font-mono font-bold text-theme-dark-primary">
            {formatCurrency(totals.grossBase)}
          </td>
          <td className="px-6 py-4 text-sm text-right text-theme-secondary-text">
            —
          </td>
          <td className="px-6 py-4 text-sm text-right font-mono font-bold text-theme-dark-primary">
            {formatCurrency(totals.commissionAmount)}
          </td>
        </tr>
      </tfoot>
    </Table>
  );
};
