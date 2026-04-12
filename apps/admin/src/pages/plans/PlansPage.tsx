import React, { useState } from 'react';
import { usePlans } from '../../features/plans';
import { Button, Badge, Input, Card, SkeletonPageWithStats, StatCard } from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';
import type { CreatePlanData, SubscriptionPlan, UpdatePlanData } from '../../features/plans';

export const PlansPage = () => {
  const { plans, loading, error, createPlan, updatePlan } = usePlans();
  const { showSnackbar } = useSnackbar();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = (): CreatePlanData => ({
    name: '', slug: '', price: 0, currency: 'BOB', billingPeriod: 'monthly',
    maxUsers: undefined, maxPatients: undefined, maxProducts: undefined,
  });

  const [form, setForm] = useState<CreatePlanData & UpdatePlanData>(emptyForm());

  if (loading && plans.length === 0) return <SkeletonPageWithStats statCount={2} tableRows={3} tableCols={5} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const activePlans = plans.filter(p => p.isActive).length;
  const totalSubs = plans.reduce((s, p) => s + (p._count?.subscriptions ?? 0), 0);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name, slug: plan.slug, price: plan.price, currency: plan.currency,
      maxUsers: plan.maxUsers ?? undefined, maxPatients: plan.maxPatients ?? undefined,
      maxProducts: plan.maxProducts ?? undefined,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, { name: form.name, price: form.price, maxUsers: form.maxUsers, maxPatients: form.maxPatients, maxProducts: form.maxProducts });
        showSnackbar('Plan actualizado', 'success');
      } else {
        await createPlan(form);
        showSnackbar('Plan creado', 'success');
      }
      setShowForm(false);
      setEditingPlan(null);
      setForm(emptyForm());
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-dark-primary">Planes de Suscripción</h1>
          <p className="text-theme-secondary-text mt-1">Gestiona los planes disponibles</p>
        </div>
        <div className="w-40">
          <Button variant="primary" onClick={() => { setEditingPlan(null); setForm(emptyForm()); setShowForm(true); }} className="!py-2.5 text-sm">
            + Nuevo Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Planes Activos" value={activePlans} variant="primary" />
        <StatCard title="Total Suscriptores" value={totalSubs} variant="success" />
      </div>

      {showForm && (
        <Card className="!p-6">
          <h2 className="text-lg font-semibold text-theme-dark-primary mb-4">
            {editingPlan ? `Editar: ${editingPlan.name}` : 'Nuevo Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre" value={form.name} onChange={set('name')} placeholder="Básico" />
              {!editingPlan && <Input label="Slug" value={form.slug} onChange={set('slug')} placeholder="basico" />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Precio (BOB/mes)" type="number" value={form.price?.toString() ?? ''} onChange={set('price')} placeholder="150" />
              <Input label="Máx. Usuarios" type="number" value={form.maxUsers?.toString() ?? ''} onChange={set('maxUsers')} placeholder="5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Máx. Pacientes" type="number" value={form.maxPatients?.toString() ?? ''} onChange={set('maxPatients')} placeholder="1000" />
              <Input label="Máx. Productos" type="number" value={form.maxProducts?.toString() ?? ''} onChange={set('maxProducts')} placeholder="500" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" variant="primary" isLoading={saving} className="flex-1">
                {editingPlan ? 'Guardar cambios' : 'Crear Plan'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-theme-dark-primary">{plan.name}</h3>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-theme-secondary-text">{plan.slug}</span>
              </div>
              <Badge variant={plan.isActive ? 'success' : 'default'} size="sm">
                {plan.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-theme-primary mb-1">
              Bs {Number(plan.price).toLocaleString()}
            </div>
            <div className="text-sm text-theme-secondary-text mb-4">/ mes ({plan.currency})</div>
            <div className="space-y-1.5 text-sm mb-4">
              {[
                { label: 'Usuarios', value: plan.maxUsers ?? '∞' },
                { label: 'Pacientes', value: plan.maxPatients ?? '∞' },
                { label: 'Productos', value: plan.maxProducts ?? '∞' },
                { label: 'Almacenamiento', value: plan.maxStorageMb ? `${plan.maxStorageMb} MB` : '∞' },
                { label: 'Suscriptores', value: plan._count?.subscriptions ?? 0 },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-theme-secondary-text">
                  <span>{item.label}</span>
                  <span className="font-semibold text-theme-primary-text">{item.value}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={() => openEdit(plan)} className="!py-2 text-sm">
              Editar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
