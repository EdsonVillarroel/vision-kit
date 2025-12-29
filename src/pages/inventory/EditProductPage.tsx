import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useInventory } from '../../features/inventory/hooks/useInventory';
import { ProductForm } from '../../features/inventory/components/ProductForm';
import type { ProductFormData } from '../../features/inventory/types';

export const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id!);
  const { updateProduct } = useInventory();

  const handleSubmit = async (data: ProductFormData) => {
    await updateProduct(id!, data);
    navigate(`/inventory/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Producto no encontrado'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(`/inventory/${id}`)}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
        >
          ← Volver a Detalles
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600 mt-2">{product.name}</p>
      </div>

      <ProductForm product={product} onSubmit={handleSubmit} />
    </div>
  );
};
