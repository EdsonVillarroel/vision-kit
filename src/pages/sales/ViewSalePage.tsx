import { useParams } from 'react-router-dom';
import { useSale } from '../../features/sales/hooks/useSales';
import { SaleDetails } from '../../features/sales/components/SaleDetails';

export const ViewSalePage = () => {
  const { id } = useParams<{ id: string }>();
  const { sale, loading, error } = useSale(id!);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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
