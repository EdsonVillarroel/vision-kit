import { useAuth } from '../../features/auth/hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas del Mes</p>
              <p className="text-2xl font-bold text-gray-900">$45,230</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-red-600">5</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Citas Próximas</h2>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Paciente {i}</p>
                  <p className="text-sm text-gray-600">Examen Visual - 10:00 AM</p>
                </div>
                <span className="text-sm text-blue-600 font-medium">Hoy</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Productos Más Vendidos</h2>
          <div className="space-y-3">
            {[
              { name: 'Lentes Progresivos', sales: 45 },
              { name: 'Armazones Ray-Ban', sales: 38 },
              { name: 'Lentes de Contacto', sales: 32 }
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} unidades</p>
                </div>
                <span className="text-2xl">📊</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
