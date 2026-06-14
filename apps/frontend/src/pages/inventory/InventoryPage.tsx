import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../features/inventory/hooks/useInventory';
import type { ProductCategory, ProductStatus } from '../../features/inventory/types';
import { SkeletonStatValue, SkeletonTableRows } from '../../components/ui/Skeleton';

const CATEGORY_LABELS: Record<string, string> = {
  frames: 'Armazones',
  lenses: 'Lentes',
  sunglasses: 'Gafas Sol',
  'contact-lenses': 'Lentes de Contacto',
  accessories: 'Accesorios',
  solutions: 'Soluciones',
};

const STATUS_LABELS: Record<string, string> = {
  'in-stock': 'En Stock',
  'in_stock': 'En Stock',
  'low-stock': 'Stock Bajo',
  'low_stock': 'Stock Bajo',
  'out-of-stock': 'Sin Stock',
  'out_of_stock': 'Sin Stock',
  discontinued: 'Descontinuado',
};

const STATUS_COLORS: Record<string, string> = {
  'in-stock': 'bg-green-100 text-green-800',
  'in_stock': 'bg-green-100 text-green-800',
  'low-stock': 'bg-yellow-100 text-yellow-800',
  'low_stock': 'bg-yellow-100 text-yellow-800',
  'out-of-stock': 'bg-red-100 text-red-800',
  'out_of_stock': 'bg-red-100 text-red-800',
  discontinued: 'bg-gray-100 text-gray-800',
};

export const InventoryPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [status, setStatus] = useState<ProductStatus | ''>('');

  const { products, loading } = useInventory(
    (category || status || search)
      ? {
          category: category as ProductCategory || undefined,
          status: status as ProductStatus || undefined,
          search: search || undefined,
        }
      : undefined
  );

  const totalValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
  const lowStockCount = products.filter(p => p.status === 'low-stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out-of-stock').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-2">Gestión de productos y stock</p>
        </div>
        <button
          onClick={() => navigate('/inventory/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Productos</p>
          {loading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Valor Total</p>
          {loading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Stock Bajo</p>
          {loading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Sin Stock</p>
          {loading ? <SkeletonStatValue /> : (
            <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todas las categorías</option>
              <option value="frames">Armazones</option>
              <option value="lenses">Lentes</option>
              <option value="sunglasses">Gafas de Sol</option>
              <option value="contact-lenses">Lentes de Contacto</option>
              <option value="accessories">Accesorios</option>
              <option value="solutions">Soluciones</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los estados</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock bajo</option>
              <option value="out_of_stock">Sin stock</option>
            </select>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <SkeletonTableRows rows={5} cols={7} />
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No se encontraron productos</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.brand && (
                        <div className="text-xs text-gray-500">{product.brand}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock <= product.minStock ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${product.sellingPrice?.toLocaleString() ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[product.status] ?? 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[product.status] ?? product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => navigate(`/inventory/${product.id}`)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => navigate(`/inventory/${product.id}/edit`)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Editar
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
