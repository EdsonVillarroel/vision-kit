import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../features/inventory/hooks/useInventory';
import { ProductForm } from '../../features/inventory/components/ProductForm';
import type { ProductFormData } from '../../features/inventory/types';

export const NewProductPage = () => {
  const navigate = useNavigate();
  const { createProduct } = useInventory();

  const handleSubmit = async (data: ProductFormData) => {
    await createProduct(data);
    navigate('/inventory');
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/inventory')}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
        >
          ← Volver a Inventario
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-600 mt-2">Agregar un nuevo producto al inventario</p>
      </div>

      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};
