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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-dark-primary tracking-tight">Inventario</h1>
          <p className="text-theme-secondary-text mt-1">Gestión de productos y stock</p>
        </div>
        <button
          onClick={() => navigate('/inventory/new')}
          className="shrink-0 px-5 py-2.5 bg-theme-primary hover:bg-theme-dark-primary text-theme-text-icons text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-[transform,box-shadow,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 focus-visible:ring-offset-2"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-sm font-medium text-theme-secondary-text">Total productos</div>
          <div className="text-2xl font-bold tnum tracking-tight text-theme-primary-text mt-1">{products.length}</div>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-sm font-medium text-theme-secondary-text">Valor inventario</div>
          <div className="text-2xl font-bold tnum tracking-tight text-theme-primary-text mt-1">
            Bs {inventoryValue.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-sm font-medium text-theme-secondary-text">Stock bajo</div>
          <div className="text-2xl font-bold tnum tracking-tight text-amber-600 mt-1">{lowStockCount}</div>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-sm font-medium text-theme-secondary-text">Agotados</div>
          <div className="text-2xl font-bold tnum tracking-tight text-red-600 mt-1">{outOfStockCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, SKU, marca..."
              className="w-full px-3 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25 placeholder:text-theme-secondary-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
              className="w-full px-3 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
            >
              <option value="">Todas</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus | '')}
              className="w-full px-3 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
            >
              <option value="">Todos</option>
              <option value="in-stock">En Stock</option>
              <option value="low-stock">Stock Bajo</option>
              <option value="out-of-stock">Agotado</option>
              <option value="discontinued">Discontinuado</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                className="w-4 h-4 rounded border-theme-divider accent-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/40"
              />
              <span className="text-sm font-medium text-theme-primary-text">Solo stock bajo</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 ring-1 ring-inset ring-red-600/20 text-red-700 px-4 py-3 rounded-xl text-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-theme-light-primary/20 border-b border-black/[0.06]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Precio venta</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-theme-light-primary/40 flex items-center justify-center text-theme-secondary-text">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-sm text-theme-secondary-text">No se encontraron productos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const categoryLabel = CATEGORIES.find(c => c.value === product.category)?.label || product.category;
                  const statusConfig = STATUS_CONFIG[product.status];

                  return (
                    <tr key={product.id} className="hover:bg-theme-light-primary/20 transition-colors duration-100">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-medium text-theme-primary-text">{product.name}</div>
                          <div className="text-sm text-theme-secondary-text">
                            SKU: {product.sku} • {product.brand}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-theme-primary-text">
                        {categoryLabel}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className={`font-medium tnum ${
                            product.stock === 0 ? 'text-red-600' :
                            product.stock <= product.minStock ? 'text-amber-600' :
                            'text-theme-primary-text'
                          }`}>
                            {product.stock} uds
                          </div>
                          <div className="text-theme-secondary-text tnum">Min: {product.minStock}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-theme-primary-text tnum">
                        Bs {product.sellingPrice.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                        {product.discount && (
                          <span className="text-green-600 ml-2">-{product.discount}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate(`/inventory/${product.id}`)}
                            className="text-theme-primary hover:text-theme-dark-primary font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded px-1"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => navigate(`/inventory/${product.id}/edit`)}
                            className="text-theme-accent hover:text-theme-primary font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded px-1"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => navigate(`/inventory/${product.id}/adjust`)}
                            className="text-green-600 hover:text-green-700 font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 rounded px-1"
                          >
                            Ajustar stock
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
