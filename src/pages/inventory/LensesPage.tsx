import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../features/inventory/hooks/useInventory';

export const LensesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [lensType, setLensType] = useState<'lenses' | 'contact-lenses' | ''>('');

  const { products, loading, error } = useInventory({
    search: search || undefined,
    category: lensType || undefined
  });

  const lenses = products.filter(
    p => p.category === 'lenses' || p.category === 'contact-lenses'
  );

  const opticalLenses = lenses.filter(p => p.category === 'lenses');
  const contactLenses = lenses.filter(p => p.category === 'contact-lenses');

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
          <h1 className="text-3xl font-bold text-gray-900">Lentes</h1>
          <p className="text-gray-600 mt-1">Lentes oftálmicos y de contacto</p>
        </div>
        <button
          onClick={() => navigate('/inventory/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Lentes</div>
          <div className="text-2xl font-bold text-gray-900">{lenses.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Lentes Oftálmicos</div>
          <div className="text-2xl font-bold text-blue-600">{opticalLenses.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Lentes de Contacto</div>
          <div className="text-2xl font-bold text-purple-600">{contactLenses.length}</div>
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
              Tipo de Lente
            </label>
            <select
              value={lensType}
              onChange={(e) => setLensType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="lenses">Lentes Oftálmicos</option>
              <option value="contact-lenses">Lentes de Contacto</option>
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
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especificaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron lentes
                  </td>
                </tr>
              ) : (
                lenses.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.brand} • {product.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.category === 'lenses' ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Oftálmico
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Contacto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.specifications && (
                        <div className="space-y-1">
                          {product.specifications.lensType && (
                            <div>
                              {product.specifications.lensType === 'single' && 'Monofocal'}
                              {product.specifications.lensType === 'bifocal' && 'Bifocal'}
                              {product.specifications.lensType === 'progressive' && 'Progresivo'}
                            </div>
                          )}
                          {product.specifications.lensMaterial && (
                            <div className="text-xs">{product.specifications.lensMaterial}</div>
                          )}
                          {product.specifications.index && (
                            <div className="text-xs">Índice: {product.specifications.index}</div>
                          )}
                          {product.specifications.baseCurve && (
                            <div className="text-xs">
                              BC: {product.specifications.baseCurve} • DIA:{' '}
                              {product.specifications.diameter}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div
                          className={`font-medium ${
                            product.stock === 0
                              ? 'text-red-600'
                              : product.stock <= product.minStock
                              ? 'text-yellow-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {product.stock} uds
                        </div>
                        <div className="text-gray-500 text-xs">Min: {product.minStock}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${product.sellingPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/inventory/${product.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
