import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockMovements } from '../../features/inventory/hooks/useInventory';

const MOVEMENT_TYPE_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  in: { label: 'Entrada', icon: '↑', className: 'text-green-600 bg-green-50' },
  out: { label: 'Salida', icon: '↓', className: 'text-red-600 bg-red-50' },
  adjustment: { label: 'Ajuste', icon: '~', className: 'text-blue-600 bg-blue-50' }
};

export const StockControlPage = () => {
  const navigate = useNavigate();
  const { movements, loading, error } = useStockMovements();
  const [filterType, setFilterType] = useState<'in' | 'out' | 'adjustment' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = movements.filter((movement) => {
    const matchesType = !filterType || movement.type === filterType;
    const matchesSearch =
      !searchTerm ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Statistics
  const totalIn = movements.filter((m) => m.type === 'in').length;
  const totalOut = movements.filter((m) => m.type === 'out').length;
  const totalAdjustments = movements.filter((m) => m.type === 'adjustment').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Control de Stock</h1>
        <p className="text-gray-600 mt-1">Historial de movimientos de inventario</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Movimientos</div>
          <div className="text-2xl font-bold text-gray-900">{movements.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Entradas</div>
          <div className="text-2xl font-bold text-green-600">{totalIn}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Salidas</div>
          <div className="text-2xl font-bold text-red-600">{totalOut}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Ajustes</div>
          <div className="text-2xl font-bold text-blue-600">{totalAdjustments}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Motivo, referencia..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimiento
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="in">Entradas</option>
              <option value="out">Salidas</option>
              <option value="adjustment">Ajustes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron movimientos
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => {
                  const typeConfig = MOVEMENT_TYPE_CONFIG[movement.type];
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(movement.date).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        <div className="text-xs text-gray-500">
                          {new Date(movement.createdAt).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.className}`}
                        >
                          <span className="mr-1 font-bold">{typeConfig.icon}</span>
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/inventory/${movement.productId}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver Producto
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            movement.type === 'in'
                              ? 'text-green-600'
                              : movement.type === 'out'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
                          {movement.quantity} uds
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{movement.previousStock}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{movement.newStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{movement.reason}</div>
                        {movement.reference && (
                          <div className="text-xs text-gray-500">Ref: {movement.reference}</div>
                        )}
                        {movement.notes && (
                          <div className="text-xs text-gray-500 mt-1">{movement.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {movement.performedBy.name}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acciones Rápidas</h3>
        <p className="text-sm text-gray-600 mb-4">
          Gestiona el inventario de tus productos
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/inventory')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Ver Todos los Productos
          </button>
          <button
            onClick={() => navigate('/inventory/new')}
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium"
          >
            Agregar Producto
          </button>
        </div>
      </div>
    </div>
  );
};
