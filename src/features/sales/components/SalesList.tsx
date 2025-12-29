import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSales } from '../hooks/useSales';
import { Badge, Button, Input, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui';
import type { SaleStatus, PaymentMethod } from '../types';

export const SalesList = () => {
  const { sales, loading, error } = useSales();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState('');

  const getStatusVariant = (status: SaleStatus): 'success' | 'warning' | 'error' | 'info' => {
    const variants: Record<SaleStatus, 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'error',
      refunded: 'info'
    };
    return variants[status];
  };

  const getStatusLabel = (status: SaleStatus) => {
    const labels: Record<SaleStatus, string> = {
      pending: 'Pendiente',
      completed: 'Completada',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada'
    };
    return labels[status];
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      check: 'Cheque',
      mixed: 'Mixto'
    };
    return labels[method];
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = searchQuery === '' ||
      sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesDate = selectedDate === '' || sale.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calcular estadísticas
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date === today && s.status === 'completed');
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthSales = sales.filter(s => s.date.startsWith(thisMonth) && s.status === 'completed');
  const monthTotal = monthSales.reduce((sum, s) => sum + s.total, 0);

  const avgTicket = monthSales.length > 0 ? monthTotal / monthSales.length : 0;

  const pendingSales = sales.filter(s => s.status === 'pending');
  const pendingTotal = pendingSales.reduce((sum, s) => sum + s.total, 0);

  if (loading && sales.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-theme-primary border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-theme-dark-primary">Ventas</h1>
          <p className="text-theme-secondary-text mt-2">Registro y gestión de ventas</p>
        </div>
        <Link to="/sales/new">
          <Button>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Venta
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-xl border border-red-400/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Hoy"
          value={`$${todayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          variant="success"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Ventas del Mes"
          value={`$${monthTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          variant="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          title="Ticket Promedio"
          value={`$${avgTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          variant="info"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Pendientes"
          value={pendingSales.length}
          variant="warning"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-theme-light-primary/10 rounded-2xl shadow-lg p-6 border border-theme-divider/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Fecha"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SaleStatus | 'all')}
              className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:bg-theme-light-primary/40 hover:bg-theme-light-primary/40 transition-all duration-300 outline-none text-theme-primary-text"
            >
              <option value="all">Todas</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
              <option value="refunded">Reembolsadas</option>
            </select>
          </div>
          <Input
            type="text"
            label="Buscar"
            placeholder="N° de venta o paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>N° Venta</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {filteredSales.length === 0 ? (
            <TableEmpty colSpan={8} message="No se encontraron ventas" />
          ) : (
            filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <span className="font-mono font-semibold text-theme-primary">
                    {sale.saleNumber}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(sale.date).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{sale.patientName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-theme-secondary-text">{sale.items.length} items</span>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-theme-dark-primary">
                    ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell>
                  {getPaymentMethodLabel(sale.paymentMethod)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(sale.status)} size="sm">
                    {getStatusLabel(sale.status)}
                  </Badge>
                </TableCell>
                <TableCell align="right">
                  <Link
                    to={`/sales/${sale.id}`}
                    className="text-theme-primary hover:text-theme-dark-primary font-semibold transition-colors duration-300"
                  >
                    Ver
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
