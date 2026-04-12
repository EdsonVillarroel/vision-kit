import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenants } from '../../features/tenants';
import {
  Button, Badge, SkeletonPageWithStats, StatCard, ConfirmModal,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
} from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';

export const TenantsPage = () => {
  const { tenants, loading, error, suspendTenant, activateTenant } = useTenants();
  const { showSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'activate' | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  if (loading && tenants.length === 0) return <SkeletonPageWithStats statCount={3} tableRows={8} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const filtered = tenants.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const active = tenants.filter(t => t.status === 'active').length;
  const suspended = tenants.filter(t => t.status === 'suspended').length;
  const cancelled = tenants.filter(t => t.status === 'cancelled').length;

  const statusVariant = (status: string) => {
    if (status === 'active') return 'success' as const;
    if (status === 'suspended') return 'warning' as const;
    return 'error' as const;
  };

  const handleAction = async () => {
    if (!actionId || !actionType) return;
    setIsActioning(true);
    try {
      if (actionType === 'suspend') {
        await suspendTenant(actionId);
        showSnackbar('Tenant suspendido', 'success');
      } else {
        await activateTenant(actionId);
        showSnackbar('Tenant activado', 'success');
      }
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setIsActioning(false);
      setActionId(null);
      setActionType(null);
    }
  };

  const selectedTenant = tenants.find(t => t.id === actionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-dark-primary">Tenants</h1>
          <p className="text-theme-secondary-text mt-1">{tenants.length} óptica{tenants.length !== 1 ? 's' : ''} registrada{tenants.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-44">
          <Link to="/tenants/new">
            <Button variant="primary" className="!py-2.5 text-sm">+ Nuevo Tenant</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Activos" value={active} variant="success" />
        <StatCard title="Suspendidos" value={suspended} variant="warning" />
        <StatCard title="Cancelados" value={cancelled} variant="default" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o slug..."
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
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead align="center">Usuarios</TableHead>
            <TableHead align="center">Pacientes</TableHead>
            <TableHead align="center">Estado</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty colSpan={7} message="No se encontraron tenants" />
          ) : (
            filtered.map(tenant => {
              const activeSub = tenant.subscriptions[0];
              return (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-theme-dark-primary">{tenant.name}</p>
                      <p className="text-xs text-theme-secondary-text">
                        {new Date(tenant.createdAt).toLocaleDateString('es-BO')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{tenant.slug}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{activeSub?.plan?.name ?? '—'}</span>
                  </TableCell>
                  <TableCell align="center">{tenant._count.users}</TableCell>
                  <TableCell align="center">{tenant._count.patients}</TableCell>
                  <TableCell align="center">
                    <Badge variant={statusVariant(tenant.status)} size="sm">
                      {tenant.status === 'active' ? 'Activo' : tenant.status === 'suspended' ? 'Suspendido' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/tenants/${tenant.id}`}
                        className="text-xs px-3 py-1.5 border border-theme-primary/30 text-theme-primary rounded-lg hover:bg-theme-light-primary transition-colors"
                      >
                        Ver
                      </Link>
                      {tenant.status === 'active' ? (
                        <button
                          onClick={() => { setActionId(tenant.id); setActionType('suspend'); }}
                          className="text-xs px-3 py-1.5 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
                        >
                          Suspender
                        </button>
                      ) : tenant.status === 'suspended' ? (
                        <button
                          onClick={() => { setActionId(tenant.id); setActionType('activate'); }}
                          className="text-xs px-3 py-1.5 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          Activar
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <ConfirmModal
        isOpen={!!actionId && actionType === 'suspend'}
        title="Suspender Tenant"
        message={`¿Suspender "${selectedTenant?.name}"? Los usuarios no podrán acceder.`}
        confirmLabel="Suspender"
        variant="warning"
        isLoading={isActioning}
        onConfirm={handleAction}
        onCancel={() => { setActionId(null); setActionType(null); }}
      />
      <ConfirmModal
        isOpen={!!actionId && actionType === 'activate'}
        title="Activar Tenant"
        message={`¿Activar "${selectedTenant?.name}"?`}
        confirmLabel="Activar"
        variant="default"
        isLoading={isActioning}
        onConfirm={handleAction}
        onCancel={() => { setActionId(null); setActionType(null); }}
      />
    </div>
  );
};
