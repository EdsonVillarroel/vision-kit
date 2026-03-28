import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Sale, SaleStatus, PaymentMethod } from '../types';
import { Button } from '../../../components/ui/Button';
import { useSales } from '../hooks/useSales';

interface SaleDetailsProps {
  sale: Sale;
}

export const SaleDetails: React.FC<SaleDetailsProps> = ({ sale }) => {
  const navigate = useNavigate();
  const { cancelSale, refundSale } = useSales();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: SaleStatus) => {
    const colors: Record<SaleStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800'
    };
    return colors[status];
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

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Por favor ingrese un motivo de cancelación');
      return;
    }
    setLoading(true);
    try {
      await cancelSale(sale.id, cancelReason);
      setShowCancelModal(false);
      navigate('/sales');
    } catch (error) {
      alert('Error al cancelar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!cancelReason.trim()) {
      alert('Por favor ingrese un motivo de reembolso');
      return;
    }
    setLoading(true);
    try {
      await refundSale(sale.id, cancelReason);
      setShowRefundModal(false);
      navigate('/sales');
    } catch (error) {
      alert('Error al procesar el reembolso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/sales')}
            className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
          >
            ← Volver a Ventas
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Venta {sale.saleNumber}</h1>
          <p className="text-gray-600 mt-2">
            {new Date(sale.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            🖨️ Imprimir
          </Button>
          {sale.status === 'completed' && (
            <Button variant="secondary" onClick={() => setShowRefundModal(true)}>
              💰 Reembolso
            </Button>
          )}
          {sale.status === 'pending' && (
            <Button variant="secondary" onClick={() => setShowCancelModal(true)}>
              ❌ Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalle de Venta */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Información de Venta</h2>
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(sale.status)}`}>
                {getStatusLabel(sale.status)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Número de Venta</p>
                <p className="font-medium text-gray-900">{sale.saleNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paciente</p>
                <Link
                  to={`/patients/${sale.patientId}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {sale.patientName}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendedor</p>
                <p className="font-medium text-gray-900">{sale.soldBy.name}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Producto</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">SKU</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Cant.</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Precio Unit.</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Desc.</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 px-2 text-sm text-gray-900">{item.productName}</td>
                      <td className="py-3 px-2 text-sm text-gray-600 text-center">{item.productSku}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right">
                        ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600 text-right">
                        {item.discount > 0 ? `${item.discount}%` : '-'}
                      </td>
                      <td className="py-3 px-2 text-sm font-medium text-gray-900 text-right">
                        ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="mt-6 border-t pt-4">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    ${sale.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento:</span>
                    <span className="font-medium text-red-600">
                      -${sale.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (16%):</span>
                  <span className="font-medium text-gray-900">
                    ${sale.tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Pago */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Pago</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Método de Pago</p>
                <p className="font-medium text-gray-900">{getPaymentMethodLabel(sale.paymentMethod)}</p>
              </div>
              {sale.payments && sale.payments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Detalle de Pagos</p>
                  {sale.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">{getPaymentMethodLabel(payment.method)}</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      {payment.reference && (
                        <span className="text-xs text-gray-500">Ref: {payment.reference}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {sale.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notas</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{sale.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Receta Asociada */}
          {sale.medicalRecordId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Receta Asociada</h3>
              <Link
                to={`/medical-records/${sale.medicalRecordId}`}
                className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                Ver Receta
              </Link>
            </div>
          )}

          {/* Garantía */}
          {sale.warrantyInfo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Garantía</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Válida hasta</p>
                  <p className="font-medium text-gray-900">
                    {new Date(sale.warrantyInfo.expiryDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Términos</p>
                  <p className="text-sm text-gray-700">{sale.warrantyInfo.terms}</p>
                </div>
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Historial</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Creada</p>
                <p className="text-gray-900">
                  {new Date(sale.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
              {sale.completedAt && (
                <div>
                  <p className="text-gray-600">Completada</p>
                  <p className="text-gray-900">
                    {new Date(sale.completedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              )}
              {sale.cancelledAt && (
                <div>
                  <p className="text-gray-600">Cancelada</p>
                  <p className="text-gray-900">
                    {new Date(sale.cancelledAt).toLocaleString('es-ES')}
                  </p>
                  {sale.cancellationReason && (
                    <p className="text-sm text-red-600 mt-1">Motivo: {sale.cancellationReason}</p>
                  )}
                </div>
              )}
              {sale.refundedAt && (
                <div>
                  <p className="text-gray-600">Reembolsada</p>
                  <p className="text-gray-900">
                    {new Date(sale.refundedAt).toLocaleString('es-ES')}
                  </p>
                  {sale.cancellationReason && (
                    <p className="text-sm text-orange-600 mt-1">Motivo: {sale.cancellationReason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cancelar Venta</h3>
            <p className="text-gray-600 mb-4">¿Está seguro de que desea cancelar esta venta?</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo de la cancelación..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
              >
                Cerrar
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Procesar Reembolso</h3>
            <p className="text-gray-600 mb-4">¿Está seguro de que desea procesar el reembolso de esta venta?</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo del reembolso..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowRefundModal(false)}
                disabled={loading}
              >
                Cerrar
              </Button>
              <Button
                onClick={handleRefund}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Confirmar Reembolso'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
