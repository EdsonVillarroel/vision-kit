import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../features/inventory/hooks/useInventory';

export const FramesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'in-stock' | 'low-stock' | 'out-of-stock' | ''>('');

  // Filtrar solo marcos (frames y sunglasses)
  const { products, loading, error } = useInventory({
    search: search || undefined,
    status: status || undefined
  });

  const frames = products.filter(p => p.category === 'frames' || p.category === 'sunglasses');
  const inStock = frames.filter(p => p.stock > p.minStock).length;
  const lowStock = frames.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = frames.filter(p => p.stock === 0).length;

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
          <h1 className="text-3xl font-bold text-gray-900">Armazones y Gafas de Sol</h1>
          <p className="text-gray-600 mt-1">Gestión de marcos y gafas</p>
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
          <div className="text-sm text-gray-600">Total Armazones</div>
          <div className="text-2xl font-bold text-gray-900">{frames.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">En Stock</div>
          <div className="text-2xl font-bold text-green-600">{inStock}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Stock Bajo</div>
          <div className="text-2xl font-bold text-yellow-600">{lowStock}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Agotados</div>
          <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, SKU, marca..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="in-stock">En Stock</option>
              <option value="low-stock">Stock Bajo</option>
              <option value="out-of-stock">Agotado</option>
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {frames.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron armazones
          </div>
        ) : (
          frames.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/inventory/${product.id}`)}
            >
              {/* Image */}
              <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <span className="text-6xl">👓</span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-800'
                        : product.stock <= product.minStock
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {product.stock === 0
                      ? 'Agotado'
                      : product.stock <= product.minStock
                      ? 'Bajo'
                      : 'Stock'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  {product.brand} • {product.sku}
                </p>

                {/* Specifications */}
                {product.specifications && (
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    {product.specifications.material && (
                      <div>Material: {product.specifications.material}</div>
                    )}
                    {product.specifications.color && (
                      <div>Color: {product.specifications.color}</div>
                    )}
                    {product.specifications.size && (
                      <div>
                        Medidas: {product.specifications.size.lens}-
                        {product.specifications.size.bridge}-
                        {product.specifications.size.temple}
                      </div>
                    )}
                  </div>
                )}

                {/* Price and Stock */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      ${product.sellingPrice.toLocaleString()}
                    </div>
                    {product.discount && (
                      <div className="text-xs text-green-600">-{product.discount}%</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {product.stock} uds
                    </div>
                    <div className="text-xs text-gray-500">Stock</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
