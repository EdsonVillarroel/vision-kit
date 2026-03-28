import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../../features/inventory/hooks/useInventory';
import { StockAdjustment } from '../../features/inventory/components/StockAdjustment';

export const AdjustStockPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id!);

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
    <div>
      <button
        onClick={() => navigate(`/inventory/${id}`)}
        className="text-blue-600 hover:text-blue-800 mb-4 text-sm font-medium"
      >
        ← Volver a Detalles
      </button>
      <StockAdjustment product={product} />
    </div>
  );
};
