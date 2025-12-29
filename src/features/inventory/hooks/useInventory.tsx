import { useEffect, useState } from 'react';
import { useSnackbar } from '../../../components/Snackbar';
import { inventoryService } from '../services/inventoryService';
import type { InventoryFilters, Product, ProductFormData, StockMovement } from '../types';

export const useInventory = (filters?: InventoryFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let results = await inventoryService.getAllProducts();

      // Aplicar filtros
      if (filters) {
        if (filters.category) {
          results = results.filter(p => p.category === filters.category);
        }
        if (filters.status) {
          results = results.filter(p => p.status === filters.status);
        }
        if (filters.brand) {
          const brandQuery = filters.brand.toLowerCase();
          results = results.filter(p => p.brand.toLowerCase().includes(brandQuery));
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          results = results.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query)
          );
        }
        if (filters.lowStock) {
          results = results.filter(p => p.stock <= p.minStock);
        }
      }

      setProducts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters?.category, filters?.status, filters?.brand, filters?.search, filters?.lowStock]);

  const createProduct = async (data: ProductFormData) => {
    setError(null);
    try {
      const newProduct = await inventoryService.createProduct(data);
      setProducts(prev => [newProduct, ...prev]);
      showSuccess('Producto agregado al inventario exitosamente');
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    setError(null);
    try {
      const updated = await inventoryService.updateProduct(id, data);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      showSuccess('Producto actualizado exitosamente');
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    setError(null);
    try {
      await inventoryService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showSuccess('Producto eliminado del inventario');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const refresh = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await inventoryService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};

export const useStockMovements = (productId?: string) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getStockMovements(productId);
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [productId]);

  const adjustStock = async (
    productId: string,
    quantity: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string,
    performedBy: { id: string; name: string },
    reference?: string
  ) => {
    setError(null);
    try {
      const movement = await inventoryService.adjustStock(
        productId,
        quantity,
        type,
        reason,
        performedBy,
        reference
      );
      setMovements(prev => [movement, ...prev]);
      showSuccess('Stock actualizado exitosamente');
      return movement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al ajustar stock';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  return {
    movements,
    loading,
    error,
    adjustStock,
    refresh: fetchMovements
  };
};

export const useLowStockProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await inventoryService.getLowStockProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos con stock bajo');
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, []);

  return { products, loading, error };
};
