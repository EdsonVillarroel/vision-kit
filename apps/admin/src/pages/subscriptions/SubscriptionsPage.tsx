import { useState } from 'react';
import { useSubscriptions } from '../../features/subscriptions';
import { usePlans } from '../../features/plans';
import {
  Badge, SkeletonPageWithStats, StatCard,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
  Button,
} from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';
import type { UpdateSubscriptionData } from '../../features/subscriptions';

export const SubscriptionsPage = () => {
  const { subscriptions, loading, error, updateSubscription } = useSubscriptions();
  const { plans } = usePlans();
  const { showSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateSubscriptionData>({});
  const [saving, setSaving] = useState(false);

  if (loading && subscriptions.length === 0) return <SkeletonPageWithStats statCount={3} tableRows={8} tableCols={6} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const filtered = subscriptions.filter(s => {
    const matchesSearch = !search || s.tenant.name.toLowerCase().includes(search.toLowerCase()) || s.tenant.slug.includes(search.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const active = subscriptions.filter(s => s.status === 'active').length;
  const pastDue = subscriptions.filter(s => s.status === 'past_due').length;
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + Number(s.plan.price), 0);

  const statusVariant = (status: string) => {
    if (status === 'active') return 'success' as const;
    if (status === 'past_due') return 'warning' as const;
    if (status === 'cancelled') return 'error' as const;
    return 'info' as const;
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { active: 'Activa', past_due: 'Vencida', cancelled: 'Cancelada', trial: 'Trial' };
    return map[status] ?? status;
  };

  const openEdit = (id: string, current: UpdateSubscriptionData) => {
    setEditingId(id);
    setEditForm(current);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateSubscription(editingId, editForm);
      showSnackbar('Suscripción actualizada', 'success');
      setEditingId(null);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-dark-primary">Suscripciones</h1>
        <p className="text-theme-secondary-text mt-1">Gestiona suscripciones, planes y pagos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Activas" value={active} variant="success" />
        <StatCard title="Vencidas" value={pastDue} variant="warning" />
        <StatCard title="MRR" value={`Bs ${mrr.toLocaleString()}`} variant="primary" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por tenant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-theme-divider rounded-lg text-sm focus:outline-none focus:border-theme-primary bg-white"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-theme-divider rounded-lg text-sm focus:outline-none focus:border-theme-primary bg-white min-w-[140px]"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="past_due">Vencidas</option>
          <option value="cancelled">Canceladas</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Tenant</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead align="center">Estado</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Vence</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty colSpan={6} message="No se encontraron suscripciones" />
          ) : (
            filtered.map(sub => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-theme-dark-primary">{sub.tenant.name}</p>
                    <span className="font-mono text-xs text-theme-secondary-text">{sub.tenant.slug}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{sub.plan.name}</p>
                    <p className="text-xs text-theme-secondary-text">Bs {Number(sub.plan.price).toLocaleString()}/mes</p>
                  </div>
                </TableCell>
                <TableCell align="center">
                  <Badge variant={statusVariant(sub.status)} size="sm">{statusLabel(sub.status)}</Badge>
                </TableCell>
                <TableCell>{new Date(sub.startedAt).toLocaleDateString('es-BO')}</TableCell>
                <TableCell>{sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('es-BO') : '—'}</TableCell>
                <TableCell align="right">
                  <button
                    onClick={() => openEdit(sub.id, {
                      planId: sub.planId,
                      status: sub.status,
                      expiresAt: sub.expiresAt ?? undefined,
                      paymentNotes: sub.paymentNotes ?? undefined,
                    })}
                    className="text-xs px-3 py-1.5 border border-theme-primary/30 text-theme-primary rounded-lg hover:bg-theme-light-primary transition-colors"
                  >
                    Editar
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setEditingId(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-theme-dark-primary">Editar Suscripción</h3>

            <div>
              <label className="block text-sm font-medium text-theme-primary-text mb-1">Plan</label>
              <select
                value={editForm.planId ?? ''}
                onChange={e => setEditForm(prev => ({ ...prev, planId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-theme-divider rounded-lg text-sm focus:outline-none focus:border-theme-primary"
              >
                <option value="">— Sin cambio —</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} (Bs {Number(p.price).toLocaleString()})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary-text mb-1">Estado</label>
              <select
                value={editForm.status ?? ''}
                onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as UpdateSubscriptionData['status'] }))}
                className="w-full px-4 py-2.5 border border-theme-divider rounded-lg text-sm focus:outline-none focus:border-theme-primary"
              >
                <option value="active">Activa</option>
                <option value="past_due">Vencida</option>
                <option value="cancelled">Cancelada</option>
                <option value="trial">Trial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary-text mb-1">Fecha de vencimiento</label>
              <input
                type="date"
                value={editForm.expiresAt ? editForm.expiresAt.split('T')[0] : ''}
                onChange={e => setEditForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-4 py-2.5 border border-theme-divider rounded-lg text-sm focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary-text mb-1">Notas de pago (QR, referencia)</label>
              <input
                type="text"
                value={editForm.paymentNotes ?? ''}
                onChange={e => setEditForm(prev => ({ ...prev, paymentNotes: e.target.value }))}
                placeholder="Transferencia recibida el 01/04/2026..."
                className="w-full px-4 py-2.5 border border-theme-divider rounded-lg text-sm focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setEditingId(null)} className="flex-1">Cancelar</Button>
              <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
