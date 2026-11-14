import { useState } from 'react';
import clsx from 'clsx';
import { Button, Input } from '../../components/ui';
import { SkeletonPageWithStats } from '../../components/ui/Skeleton';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLensOptions } from '../../features/inventory/hooks/useLensOptions';
import { LENS_GROUPS } from '../../features/inventory/lensOptions';
import type { LensOptionGroup, Product } from '../../features/inventory/types';

const EMPTY_FORM = { name: '', group: 'material' as LensOptionGroup, sellingPrice: '', costPrice: '' };

export const LensesPage = () => {
  const { user } = useAuth();
  const canManage = user?.role !== 'optician';
  const { options, loading, createOption, updateOption, setActive } = useLensOptions();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const groupInfo = LENS_GROUPS.find((g) => g.value === form.group);
  const price = parseFloat(form.sellingPrice);
  const canSave = form.name.trim().length > 0 && price > 0;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (option: Product) => {
    setEditingId(option.id);
    setForm({
      name: option.name,
      group: (option.specifications?.lensType as LensOptionGroup) ?? 'material',
      sellingPrice: option.sellingPrice.toString(),
      costPrice: option.costPrice ? option.costPrice.toString() : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    const input = {
      name: form.name.trim(),
      group: form.group,
      sellingPrice: price,
      costPrice: parseFloat(form.costPrice) || 0,
    };
    const saved = editingId ? await updateOption(editingId, input) : await createOption(input);
    setSaving(false);
    if (saved) resetForm();
  };

  if (loading) {
    return <SkeletonPageWithStats statCount={3} tableRows={6} tableCols={4} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lentes y materiales</h1>
        <p className="text-gray-600 mt-1">
          Lo que cobras al armar unos lentes. Aparece en cada venta y no lleva control de stock.
        </p>
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar opción' : 'Agregar opción'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="lens-group" className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
              <select
                id="lens-group"
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value as LensOptionGroup })}
                className="w-full px-3 py-2 border border-theme-divider rounded-lg focus:ring-2 focus:ring-theme-primary/30"
              >
                {LENS_GROUPS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={groupInfo?.placeholder}
              required
            />
            <Input
              label="Precio de venta (Bs)"
              type="number"
              min="0"
              step="0.01"
              value={form.sellingPrice}
              onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
              required
            />
            <Input
              label="Costo (Bs)"
              type="number"
              min="0"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <Button type="submit" isLoading={saving} disabled={!canSave} className="!w-auto px-5">
              {editingId ? 'Guardar cambios' : 'Agregar'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="!w-auto px-5">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}

      {options.length === 0 ? (
        <div className="bg-white rounded-lg shadow px-6 py-16 text-center">
          <p className="text-base font-semibold text-gray-900 mb-1">Aún no hay lentes ni materiales</p>
          <p className="text-sm text-gray-500">
            Agrega Progresivo, MR8, Blue Block, Antirreflejo y lo demás que cobras para usarlos en las ventas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {LENS_GROUPS.map((group) => {
            const groupOptions = options.filter((o) => o.specifications?.lensType === group.value);
            return (
              <section key={group.value} className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-900 mb-2">{group.label}</h2>
                {groupOptions.length === 0 ? (
                  <p className="py-4 text-sm text-gray-500">Sin opciones todavía.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {groupOptions.map((option) => {
                      const active = option.status !== 'discontinued';
                      return (
                        <li key={option.id} className="flex items-center justify-between gap-3 py-3">
                          <div className={clsx('min-w-0', !active && 'opacity-50')}>
                            <p className="truncate font-medium text-gray-900">{option.name}</p>
                            <p className="text-sm text-gray-500 tabular-nums">
                              Bs {option.sellingPrice.toLocaleString()}
                              {!active && ' · Inactivo'}
                            </p>
                          </div>
                          {canManage && (
                            <div className="flex shrink-0 gap-3 text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => startEdit(option)}
                                className="text-theme-primary hover:text-theme-dark-primary"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => setActive(option.id, !active)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {active ? 'Desactivar' : 'Activar'}
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
