import { useNavigate } from 'react-router-dom';

export const InventoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-2">Gestión de productos y stock</p>
        </div>
        <button onClick={() => navigate('/inventory/new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          ➕ Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Productos</p>
          <p className="text-3xl font-bold text-gray-900">248</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Valor Total</p>
          <p className="text-3xl font-bold text-gray-900">$890K</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Stock Bajo</p>
          <p className="text-3xl font-bold text-red-600">12</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Sin Stock</p>
          <p className="text-3xl font-bold text-red-600">3</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Todas las categorías</option>
              <option>👓 Armazones</option>
              <option>🔬 Lentes</option>
              <option>😎 Gafas de Sol</option>
              <option>👁️ Lentes de Contacto</option>
              <option>🧰 Accesorios</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Todos los estados</option>
              <option>En stock</option>
              <option>Stock bajo</option>
              <option>Sin stock</option>
            </select>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {[
                { sku: 'FRM-RB-5228', name: 'Ray-Ban Wayfarer', category: 'Armazones', stock: 15, price: 1500, status: 'in-stock' },
                { sku: 'LNS-ESS-1.6', name: 'Lente Essilor 1.6', category: 'Lentes', stock: 48, price: 900, status: 'in-stock' },
                { sku: 'SUN-OKL-9013', name: 'Oakley Holbrook', category: 'Gafas Sol', stock: 3, price: 2400, status: 'low-stock' },
                { sku: 'CTL-ACU-OASYS', name: 'Acuvue Oasys', category: 'LC', stock: 25, price: 750, status: 'in-stock' },
                { sku: 'ACC-CASE-001', name: 'Estuche Premium', category: 'Accesorios', stock: 0, price: 150, status: 'out-of-stock' }
              ].map((product, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{product.sku}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      product.stock === 0 ? 'text-red-600' :
                      product.stock < 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                      product.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'in-stock' ? 'En Stock' :
                       product.status === 'low-stock' ? 'Stock Bajo' :
                       'Sin Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => navigate(`/inventory/${product.sku}`)} className="text-blue-600 hover:text-blue-800 mr-3">Ver</button>
                    <button onClick={() => navigate(`/inventory/${product.sku}/edit`)} className="text-gray-600 hover:text-gray-800">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
