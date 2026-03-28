import { useNavigate } from 'react-router-dom';
import { useSales } from '../../features/sales/hooks/useSales';
import { SaleForm } from '../../features/sales/components/SaleForm';
import type { SaleFormData } from '../../features/sales/types';

export const NewSalePage = () => {
  const navigate = useNavigate();
  const { createSale } = useSales();

  const handleSubmit = async (data: SaleFormData) => {
    await createSale(data);
    navigate('/sales');
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/sales')}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
        >
          ← Volver a Ventas
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Venta</h1>
        <p className="text-gray-600 mt-2">Punto de venta - Registrar nueva transacción</p>
      </div>

      <SaleForm onSubmit={handleSubmit} />
    </div>
  );
};
