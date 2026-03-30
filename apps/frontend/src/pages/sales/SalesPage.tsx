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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-2">Registro y gestión de ventas</p>
        </div>
        <button
          onClick={() => navigate('/sales/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nueva Venta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Ventas Hoy</p>
          {summaryLoading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-gray-900">${todayRevenue.toLocaleString()}</p>
          )}
          {todayData && (
            <p className="text-sm text-gray-500 mt-2">{todayData.count} transacciones</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Ventas del Mes</p>
          {summaryLoading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-gray-900">${(summary?.totalRevenue ?? 0).toLocaleString()}</p>
          )}
          {summary && (
            <p className="text-sm text-gray-500 mt-2">{summary.totalSales} transacciones</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Ticket Promedio</p>
          {summaryLoading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-gray-900">${Math.round(summary?.averageTicket ?? 0).toLocaleString()}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Pendientes</p>
          {loading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-yellow-600">{pendingSales.length}</p>
          )}
          {!loading && pendingSales.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              ${pendingTotal.toLocaleString()} total
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SaleStatus | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <SkeletonTableRows rows={5} cols={8} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No se encontraron ventas</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Venta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{sale.saleNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{sale.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.items.length}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${sale.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[sale.status] ?? 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[sale.status] ?? sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => navigate(`/sales/${sale.id}`)}
                        className="text-blue-600 hover:text-blue-800"
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
