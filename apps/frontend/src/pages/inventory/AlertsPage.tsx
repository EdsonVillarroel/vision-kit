import { useNavigate } from 'react-router-dom';
import { useLowStockProducts, useInventory } from '../../features/inventory/hooks/useInventory';

export const AlertsPage = () => {
  const navigate = useNavigate();
  const { products: lowStockProducts, loading: loadingLowStock } = useLowStockProducts();
  const { products: allProducts, loading: loadingAll } = useInventory();

  const outOfStockProducts = allProducts.filter((p) => p.stock === 0);
  const discontinuedProducts = allProducts.filter((p) => p.status === 'discontinued');

  const loading = loadingLowStock || loadingAll;

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
        <h1 className="text-3xl font-bold text-gray-900">Alertas de Inventario</h1>
        <p className="text-gray-600 mt-1">
          Productos que requieren atención inmediata
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-800 font-medium">Stock Bajo</div>
              <div className="text-3xl font-bold text-yellow-900 mt-1">
                {lowStockProducts.length}
              </div>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
          <p className="text-xs text-yellow-700 mt-2">
            Productos por debajo del stock mínimo
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-red-800 font-medium">Agotados</div>
              <div className="text-3xl font-bold text-red-900 mt-1">
                {outOfStockProducts.length}
              </div>
            </div>
            <div className="text-4xl">⛔</div>
          </div>
          <p className="text-xs text-red-700 mt-2">Productos sin stock disponible</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-800 font-medium">Discontinuados</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">
                {discontinuedProducts.length}
              </div>
            </div>
            <div className="text-4xl">🚫</div>
          </div>
          <p className="text-xs text-gray-700 mt-2">Productos descontinuados</p>
        </div>
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-yellow-900 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Productos con Stock Bajo ({lowStockProducts.length})
            </h2>
            <p className="text-sm text-yellow-700 mt-1">
              Estos productos están por debajo de su stock mínimo recomendado
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-yellow-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.brand} • {product.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {product.category.replace('-', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-sm font-bold rounded-full bg-yellow-100 text-yellow-800">
                        {product.stock} uds
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.minStock} uds
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.supplier?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => navigate(`/inventory/${product.id}/adjust`)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Reabastecer
                      </button>
                      <button
                        onClick={() => navigate(`/inventory/${product.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Out of Stock Products */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-red-900 flex items-center">
              <span className="text-2xl mr-2">⛔</span>
              Productos Agotados ({outOfStockProducts.length})
            </h2>
            <p className="text-sm text-red-700 mt-1">
              Estos productos no tienen stock disponible
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Reabastecimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outOfStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-red-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.brand} • {product.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {product.category.replace('-', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.lastRestocked
                        ? new Date(product.lastRestocked).toLocaleDateString('es-MX')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.supplier?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => navigate(`/inventory/${product.id}/adjust`)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Reabastecer
                      </button>
                      <button
                        onClick={() => navigate(`/inventory/${product.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discontinued Products */}
      {discontinuedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">🚫</span>
              Productos Discontinuados ({discontinuedProducts.length})
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              Estos productos ya no están disponibles para la venta
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Restante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discontinuedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.brand} • {product.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {product.category.replace('-', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock} uds</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/inventory/${product.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Alerts */}
      {lowStockProducts.length === 0 &&
        outOfStockProducts.length === 0 &&
        discontinuedProducts.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              ¡Todo en orden!
            </h3>
            <p className="text-green-700">
              No hay productos que requieran atención en este momento.
            </p>
          </div>
        )}

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recomendaciones</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              Revisa regularmente los productos con stock bajo para evitar desabastecimiento
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              Contacta a tus proveedores con anticipación para productos críticos
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              Considera ajustar los niveles de stock mínimo según la demanda histórica
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
