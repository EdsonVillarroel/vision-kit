import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant, useTenants } from '../../features/tenants';
import { Button, Input, Card, SkeletonFormCard } from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';

export const EditTenantPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant, loading, error } = useTenant(id!);
  const { updateTenant } = useTenants();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    primaryColor: '',
    secondaryColor: '',
    accentColor: '',
    domain: '',
  });

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name,
        primaryColor: tenant.primaryColor ?? '#4f46e5',
        secondaryColor: tenant.secondaryColor ?? '',
        accentColor: tenant.accentColor ?? '',
        domain: tenant.domain ?? '',
      });
    }
  }, [tenant]);

  if (loading) return <SkeletonFormCard />;
  if (error || !tenant) return <div className="text-red-500 p-4">{error ?? 'Tenant no encontrado'}</div>;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTenant(id!, {
        name: form.name || undefined,
        primaryColor: form.primaryColor || undefined,
        secondaryColor: form.secondaryColor || undefined,
        accentColor: form.accentColor || undefined,
        domain: form.domain || undefined,
      });
      showSnackbar('Tenant actualizado', 'success');
      navigate(`/tenants/${id}`);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error al actualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate(`/tenants/${id}`)} className="text-theme-secondary-text hover:text-theme-primary text-sm mb-2 block transition-colors">
          ← Volver al detalle
        </button>
        <h1 className="text-3xl font-bold text-theme-dark-primary">Editar Tenant</h1>
        <p className="text-theme-secondary-text mt-1">{tenant.name}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={set('name')} placeholder="Nombre de la óptica" />
          <Input label="Dominio (opcional)" value={form.domain} onChange={set('domain')} placeholder="optica.com" />

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Color primario', field: 'primaryColor', value: form.primaryColor },
              { label: 'Color secundario', field: 'secondaryColor', value: form.secondaryColor },
              { label: 'Color acento', field: 'accentColor', value: form.accentColor },
            ].map(item => (
              <div key={item.field}>
                <label className="block text-sm font-medium text-theme-primary-text mb-2">{item.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={item.value || '#4f46e5'}
                    onChange={set(item.field)}
                    className="w-10 h-10 rounded border border-theme-divider cursor-pointer"
                  />
                  <span className="text-xs font-mono text-theme-secondary-text">{item.value || '—'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(`/tenants/${id}`)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saving} className="flex-1">
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
