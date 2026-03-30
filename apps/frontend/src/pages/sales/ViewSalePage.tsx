import { useParams } from 'react-router-dom';
import { useSale } from '../../features/sales/hooks/useSales';
import { SaleDetails } from '../../features/sales/components/SaleDetails';
import { SkeletonDetailCard } from '../../components/ui/Skeleton';

export const ViewSalePage = () => {
  const { id } = useParams<{ id: string }>();
  const { sale, loading, error } = useSale(id!);

  if (loading) {
    return <SkeletonDetailCard />;
  }

  if (error || !sale) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Venta no encontrada'}
      </div>
    );
  }

  return <SaleDetails sale={sale} />;
};
