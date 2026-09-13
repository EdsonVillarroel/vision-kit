import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales, useSalesSummary } from '../../features/sales/hooks/useSales';
import type { SaleStatus } from '../../features/sales/types';
import { SkeletonStatValue, SkeletonTableRows } from '../../components/ui/Skeleton';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  check: 'Cheque',
  mixed: 'Mixto',
};

const money = (n: number) => `Bs ${n.toLocaleString('es-BO')}`;

export const SalesPage = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = `${today.slice(0, 7)}-01`;

  const [statusFilter, setStatusFilter] = useState<SaleStatus | ''>('');
  const [dateFilter, setDateFilter] = useState(today);
  const [search, setSearch] = useState('');

  // dateFilter como query param al backend (mismo valor para from y to = filtro por día exacto)
  const { sales, loading } = useSales(dateFilter || undefined, dateFilter || undefined);
  const { summary, loading: summaryLoading } = useSalesSummary(startOfMonth, today);

  // Compute today stats from salesByDay
  const todayData = summary?.salesByDay?.find((d: { date: string }) => d.date === today);
  const todayRevenue = todayData?.amount ?? 0;

  // Filtros client-side: status y búsqueda (fecha ya va al backend)
  const filtered = sales.filter((sale) => {
    if (statusFilter && sale.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !sale.saleNumber.toLowerCase().includes(q) &&
        !sale.patientName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const pendingSales = sales.filter((s) => s.status === 'pending');
  const pendingTotal = pendingSales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-dark-primary tracking-tight">Ventas</h1>
          <p className="text-theme-secondary-text mt-1">Registro y gestión de ventas</p>
        </div>
        <button
          onClick={() => navigate('/sales/new')}
          className="shrink-0 px-5 py-2.5 bg-theme-primary hover:bg-theme-dark-primary text-theme-text-icons text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-[transform,box-shadow,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 focus-visible:ring-offset-2"
        >
          Nueva venta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Ventas hoy</p>
          {summaryLoading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold tnum tracking-tight text-theme-primary-text">{money(todayRevenue)}</p>
          )}
          {todayData && (
            <p className="text-sm text-theme-secondary-text mt-2"><span className="tnum">{todayData.count}</span> transacciones</p>
          )}
        </div>

        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Ventas del mes</p>
          {summaryLoading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold tnum tracking-tight text-theme-primary-text">{money(summary?.totalRevenue ?? 0)}</p>
          )}
          {summary && (
            <p className="text-sm text-theme-secondary-text mt-2"><span className="tnum">{summary.totalSales}</span> transacciones</p>
          )}
        </div>

        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Ticket promedio</p>
          {summaryLoading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold tnum tracking-tight text-theme-primary-text">{money(Math.round(summary?.averageTicket ?? 0))}</p>
          )}
        </div>

        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Pendientes</p>
          {loading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold tnum tracking-tight text-amber-600">{pendingSales.length}</p>
          )}
          {!loading && pendingSales.length > 0 && (
            <p className="text-sm text-theme-secondary-text mt-2">
              <span className="tnum">{money(pendingTotal)}</span> total
            </p>
          )}
        </div>
      </div>

      <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-black/[0.06]">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SaleStatus | '')}
              className="px-4 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
            >
              <option value="">Todas</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
              <option value="refunded">Reembolsadas</option>
            </select>
            <input
              type="text"
              placeholder="Buscar por número de venta o paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25 placeholder:text-theme-secondary-text"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <SkeletonTableRows rows={5} cols={8} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-full bg-theme-light-primary/40 flex items-center justify-center mb-3 text-theme-secondary-text">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-theme-secondary-text">No se encontraron ventas</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-theme-light-primary/20 border-b border-black/[0.06]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">N° Venta</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-theme-light-primary/20 transition-colors duration-100">
                    <td className="px-6 py-4 text-sm font-semibold text-theme-primary">{sale.saleNumber}</td>
                    <td className="px-6 py-4 text-sm text-theme-secondary-text tnum">{sale.date}</td>
                    <td className="px-6 py-4 text-sm text-theme-primary-text">{sale.patientName}</td>
                    <td className="px-6 py-4 text-sm text-theme-secondary-text tnum">{sale.items.length}</td>
                    <td className="px-6 py-4 text-sm font-medium text-theme-primary-text tnum">
                      {money(sale.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-secondary-text">
                      {METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[sale.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[sale.status] ?? sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => navigate(`/sales/${sale.id}`)}
                        className="font-medium text-theme-primary hover:text-theme-dark-primary transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded px-1"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
