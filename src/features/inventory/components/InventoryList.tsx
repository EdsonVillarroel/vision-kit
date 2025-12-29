import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import type { ProductCategory, ProductStatus } from '../types';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'frames', label: 'Marcos' },
  { value: 'lenses', label: 'Lentes' },
  { value: 'sunglasses', label: 'Gafas de Sol' },
  { value: 'contact-lenses', label: 'Lentes de Contacto' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'solutions', label: 'Soluciones' }
];

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  'in-stock': { label: 'En Stock', className: 'bg-green-100 text-green-800' },
  'low-stock': { label: 'Stock Bajo', className: 'bg-yellow-100 text-yellow-800' },
  'out-of-stock': { label: 'Agotado', className: 'bg-red-100 text-red-800' },
  'discontinued': { label: 'Discontinuado', className: 'bg-gray-100 text-gray-800' }
};

export const InventoryList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [lowStock, setLowStock] = useState(false);

  const { products, loading, error } = useInventory({
    search: search || undefined,
    category: category || undefined,
    status: status || undefined,
    lowStock
  });

  const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestión de productos y stock</p>
        </div>
        <button
          onClick={() => navigate('/inventory/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Productos</div>
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Valor Inventario</div>
          <div className="text-2xl font-bold text-gray-900">
            ${inventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Stock Bajo</div>
          <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Agotados</div>
          <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, SKU, marca..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="in-stock">En Stock</option>
              <option value="low-stock">Stock Bajo</option>
              <option value="out-of-stock">Agotado</option>
              <option value="discontinued">Discontinuado</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Solo stock bajo</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const categoryLabel = CATEGORIES.find(c => c.value === product.category)?.label || product.category;
                  const statusConfig = STATUS_CONFIG[product.status];

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku} • {product.brand}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {categoryLabel}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className={`font-medium ${
                            product.stock === 0 ? 'text-red-600' :
                            product.stock <= product.minStock ? 'text-yellow-600' :
                            'text-gray-900'
                          }`}>
                            {product.stock} uds
                          </div>
                          <div className="text-gray-500">Min: {product.minStock}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${product.sellingPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        {product.discount && (
                          <span className="text-green-600 ml-2">-{product.discount}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/inventory/${product.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => navigate(`/inventory/${product.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => navigate(`/inventory/${product.id}/adjust`)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Ajustar Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
