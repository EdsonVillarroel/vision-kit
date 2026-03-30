import { useParams } from 'react-router-dom';
import { useProduct } from '../../features/inventory/hooks/useInventory';
import { ProductDetails } from '../../features/inventory/components/ProductDetails';
import { SkeletonDetailCard } from '../../components/ui/Skeleton';

export const ViewProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id!);

  if (loading) {
    return <SkeletonDetailCard />;
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Producto no encontrado'}
      </div>
    );
  }

  return <ProductDetails product={product} />;
};
