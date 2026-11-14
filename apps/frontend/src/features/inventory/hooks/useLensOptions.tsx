import { useEffect, useState } from 'react';
import { useSnackbar } from '../../../components/Snackbar';
import { handleApiError } from '../../subscription';
import { inventoryService } from '../services/inventoryService';
import type { LensOptionGroup, Product } from '../types';

export interface LensOptionInput {
  name: string;
  group: LensOptionGroup;
  sellingPrice: number;
  costPrice: number;
}

const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);

const toPayload = ({ name, group, sellingPrice, costPrice }: LensOptionInput) => ({
  name,
  sellingPrice,
  costPrice,
  specifications: { lensType: group },
});

export const useLensOptions = () => {
  const [options, setOptions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    inventoryService
      .getAllProducts({ category: 'lens-options' })
      .then(setOptions)
      .catch((err) => showError(err instanceof Error ? err.message : 'Error al cargar lentes y materiales'))
      .finally(() => setLoading(false));
  }, []);

  const replace = (updated: Product) =>
    setOptions((prev) => prev.map((o) => (o.id === updated.id ? updated : o)).sort(byName));

  const fail = (err: unknown, fallback: string) => {
    if (!handleApiError(err)) showError(err instanceof Error ? err.message : fallback);
  };

  const createOption = async (input: LensOptionInput) => {
    try {
      const created = await inventoryService.createProduct({
        ...toPayload(input),
        sku: `LEN-${Date.now().toString(36).toUpperCase()}`,
        category: 'lens-options',
        brand: '',
        stock: 0,
        minStock: 0,
      });
      setOptions((prev) => [...prev, created].sort(byName));
      showSuccess(`${created.name} agregado`);
      return true;
    } catch (err) {
      fail(err, 'Error al agregar');
      return false;
    }
  };

  const updateOption = async (id: string, input: LensOptionInput) => {
    try {
      replace(await inventoryService.updateProduct(id, toPayload(input)));
      showSuccess('Cambios guardados');
      return true;
    } catch (err) {
      fail(err, 'Error al guardar');
      return false;
    }
  };

  const setActive = async (id: string, active: boolean) => {
    try {
      replace(await inventoryService.setProductActive(id, active));
    } catch (err) {
      fail(err, 'Error al actualizar');
    }
  };

  return { options, loading, createOption, updateOption, setActive };
};
