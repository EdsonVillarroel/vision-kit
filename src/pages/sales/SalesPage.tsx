export const SalesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-2">Registro y gestión de ventas</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          🛒 Nueva Venta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Ventas Hoy</p>
          <p className="text-3xl font-bold text-gray-900">$12,450</p>
          <p className="text-sm text-green-600 mt-2">+15% vs ayer</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Ventas del Mes</p>
          <p className="text-3xl font-bold text-gray-900">$345,230</p>
          <p className="text-sm text-green-600 mt-2">+8% vs mes anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Ticket Promedio</p>
          <p className="text-3xl font-bold text-gray-900">$2,840</p>
          <p className="text-sm text-gray-500 mt-2">142 transacciones</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">3</p>
          <p className="text-sm text-gray-500 mt-2">$8,500 total</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg"
              defaultValue="2024-12-03"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Todas</option>
              <option>Completadas</option>
              <option>Pendientes</option>
              <option>Canceladas</option>
            </select>
            <input
              type="text"
              placeholder="Buscar por número de venta o paciente..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Venta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { num: 'VNT-2024-045', date: '2024-12-03', patient: 'Juan Pérez', items: 3, total: 3828, method: 'Tarjeta', status: 'Completada' },
                { num: 'VNT-2024-044', date: '2024-12-02', patient: 'Ana García', items: 2, total: 2680, method: 'Efectivo', status: 'Completada' },
                { num: 'VNT-2024-043', date: '2024-12-01', patient: 'Roberto Martínez', items: 2, total: 1775, method: 'Mixto', status: 'Completada' },
                { num: 'VNT-2024-042', date: '2024-11-30', patient: 'María López', items: 1, total: 2400, method: 'Tarjeta', status: 'Pendiente' }
              ].map((sale, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{sale.num}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.patient}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.items}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${sale.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sale.status === 'Completada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button className="text-blue-600 hover:text-blue-800">Ver</button>
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
