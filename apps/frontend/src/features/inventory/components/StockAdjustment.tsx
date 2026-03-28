import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockMovements } from '../hooks/useInventory';
import type { Product } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

interface StockAdjustmentProps {
  product: Product;
  onSuccess?: () => void;
}

const MOVEMENT_TYPES = [
  { value: 'in', label: 'Entrada (Agregar)', color: 'green' },
  { value: 'out', label: 'Salida (Retirar)', color: 'red' },
  { value: 'adjustment', label: 'Ajuste (Establecer cantidad exacta)', color: 'blue' }
] as const;

export const StockAdjustment = ({ product, onSuccess }: StockAdjustmentProps) => {
  const navigate = useNavigate();
  const { adjustStock } = useStockMovements(product.id);
  const { user } = useAuth();

  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNewStock = () => {
    const qty = parseInt(quantity) || 0;
    if (type === 'in') {
      return product.stock + qty;
    } else if (type === 'out') {
      return Math.max(0, product.stock - qty);
    } else {
      return qty;
    }
  };

  const newStock = calculateNewStock();
  const stockDiff = newStock - product.stock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!quantity || parseInt(quantity) < 0) {
      setError('La cantidad debe ser mayor o igual a 0');
      return;
    }

    if (!reason.trim()) {
      setError('El motivo es requerido');
      return;
    }

    if (type === 'out' && parseInt(quantity) > product.stock) {
      setError('No hay suficiente stock para esta salida');
      return;
    }

    setSubmitting(true);

    try {
      await adjustStock(
        product.id,
        parseInt(quantity),
        type,
        reason.trim(),
        {
          id: user?.id || 'UNKNOWN',
          name: user?.name || 'Usuario Desconocido'
        },
        reference.trim() || undefined
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/inventory/${product.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ajustar el stock');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = MOVEMENT_TYPES.find(t => t.value === type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ajustar Stock</h1>
        <p className="text-gray-600 mt-2">
          {product.name} • SKU: {product.sku}
        </p>
      </div>

      {/* Current Stock Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-blue-600">Stock Actual</div>
            <div className="text-3xl font-bold text-gray-900">{product.stock} uds</div>
          </div>
          <div>
            <div className="text-sm text-blue-600">Stock Mínimo</div>
            <div className="text-lg font-semibold text-gray-900">{product.minStock} uds</div>
          </div>
          <div>
            <div className="text-sm text-blue-600">Estado</div>
            <div className={`text-lg font-semibold ${
              product.stock === 0 ? 'text-red-600' :
              product.stock <= product.minStock ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {product.stock === 0 ? 'Agotado' :
               product.stock <= product.minStock ? 'Stock Bajo' :
               'En Stock'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Movement Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipo de Movimiento</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MOVEMENT_TYPES.map((movementType) => (
              <button
                key={movementType.value}
                type="button"
                onClick={() => setType(movementType.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  type === movementType.value
                    ? `border-${movementType.color}-500 bg-${movementType.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-semibold ${
                  type === movementType.value ? `text-${movementType.color}-700` : 'text-gray-900'
                }`}>
                  {movementType.label}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {movementType.value === 'in' && 'Agregar productos al inventario'}
                  {movementType.value === 'out' && 'Retirar productos del inventario'}
                  {movementType.value === 'adjustment' && 'Establecer cantidad exacta'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Movimiento</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={type === 'adjustment' ? 'Nueva cantidad total' : 'Cantidad a mover'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
              {quantity && (
                <div className="mt-2 text-sm">
                  {type === 'in' && (
                    <span className="text-green-600">
                      ➜ Nuevo stock: {newStock} uds (+{stockDiff})
                    </span>
                  )}
                  {type === 'out' && (
                    <span className="text-red-600">
                      ➜ Nuevo stock: {newStock} uds ({stockDiff})
                    </span>
                  )}
                  {type === 'adjustment' && (
                    <span className="text-blue-600">
                      ➜ Nuevo stock: {newStock} uds ({stockDiff >= 0 ? '+' : ''}{stockDiff})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione un motivo...</option>
                {type === 'in' && (
                  <>
                    <option value="Reabastecimiento">Reabastecimiento</option>
                    <option value="Compra a proveedor">Compra a proveedor</option>
                    <option value="Devolución de cliente">Devolución de cliente</option>
                    <option value="Transferencia de sucursal">Transferencia de sucursal</option>
                    <option value="Corrección de inventario">Corrección de inventario</option>
                  </>
                )}
                {type === 'out' && (
                  <>
                    <option value="Venta">Venta</option>
                    <option value="Producto dañado">Producto dañado</option>
                    <option value="Producto vencido">Producto vencido</option>
                    <option value="Devolución a proveedor">Devolución a proveedor</option>
                    <option value="Transferencia a sucursal">Transferencia a sucursal</option>
                    <option value="Pérdida/Robo">Pérdida/Robo</option>
                    <option value="Corrección de inventario">Corrección de inventario</option>
                  </>
                )}
                {type === 'adjustment' && (
                  <>
                    <option value="Inventario físico">Inventario físico</option>
                    <option value="Corrección de error">Corrección de error</option>
                    <option value="Ajuste de sistema">Ajuste de sistema</option>
                  </>
                )}
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia (Opcional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej: VNT-2024-001, PO-2024-042"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Número de venta, orden de compra, o cualquier referencia relacionada
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {quantity && reason && (
          <div className={`border-2 rounded-lg p-6 ${
            selectedType?.color === 'green' ? 'border-green-200 bg-green-50' :
            selectedType?.color === 'red' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-3">Vista Previa del Ajuste</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tipo:</span>
                <span className="ml-2 font-medium">{selectedType?.label}</span>
              </div>
              <div>
                <span className="text-gray-600">Cantidad:</span>
                <span className="ml-2 font-medium">{quantity} uds</span>
              </div>
              <div>
                <span className="text-gray-600">Stock actual:</span>
                <span className="ml-2 font-medium">{product.stock} uds</span>
              </div>
              <div>
                <span className="text-gray-600">Nuevo stock:</span>
                <span className={`ml-2 font-bold ${
                  newStock === 0 ? 'text-red-600' :
                  newStock <= product.minStock ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {newStock} uds
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Motivo:</span>
                <span className="ml-2 font-medium">{reason}</span>
              </div>
              {reference && (
                <div className="col-span-2">
                  <span className="text-gray-600">Referencia:</span>
                  <span className="ml-2 font-medium">{reference}</span>
                </div>
              )}
            </div>

            {newStock <= product.minStock && newStock > 0 && (
              <div className="mt-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded text-sm">
                ⚠️ Advertencia: El nuevo stock estará por debajo del mínimo recomendado
              </div>
            )}

            {newStock === 0 && (
              <div className="mt-4 bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded text-sm">
                ⛔ Advertencia: El producto quedará sin stock
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/inventory/${product.id}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-6 py-2 text-white rounded-lg font-medium disabled:bg-gray-400 ${
              selectedType?.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
              selectedType?.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={submitting}
          >
            {submitting ? 'Procesando...' : 'Confirmar Ajuste'}
          </button>
        </div>
      </form>
    </div>
  );
};
