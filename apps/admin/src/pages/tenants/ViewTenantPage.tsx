import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTenant, useTenants } from '../../features/tenants';
import { Badge, Button, ConfirmModal, SkeletonDetailCard } from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';

export const ViewTenantPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant, loading, error } = useTenant(id!);
  const { suspendTenant, activateTenant } = useTenants();
  const { showSnackbar } = useSnackbar();

  const [showConfirm, setShowConfirm] = useState<'suspend' | 'activate' | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  if (loading) return <SkeletonDetailCard />;
  if (error || !tenant) return <div className="text-red-500 p-4">{error ?? 'Tenant no encontrado'}</div>;

  const activeSub = tenant.subscriptions[0];

  const statusVariant = (status: string) => {
    if (status === 'active') return 'success' as const;
    if (status === 'suspended') return 'warning' as const;
    return 'error' as const;
  };

  const handleAction = async () => {
    if (!showConfirm) return;
    setIsActioning(true);
    try {
      if (showConfirm === 'suspend') {
        await suspendTenant(tenant.id);
        showSnackbar('Tenant suspendido', 'success');
      } else {
        await activateTenant(tenant.id);
        showSnackbar('Tenant activado', 'success');
      }
      navigate('/tenants');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setIsActioning(false);
      setShowConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate('/tenants')} className="text-theme-secondary-text hover:text-theme-primary transition-colors">
              ← Tenants
            </button>
          </div>
          <h1 className="text-3xl font-bold text-theme-dark-primary">{tenant.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{tenant.slug}</span>
            <Badge variant={statusVariant(tenant.status)} size="sm">
              {tenant.status === 'active' ? 'Activo' : tenant.status === 'suspended' ? 'Suspendido' : 'Cancelado'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/tenants/${id}/edit`}>
            <Button variant="outline" className="!py-2 !px-4 !w-auto text-sm">Editar</Button>
          </Link>
          {tenant.status === 'active' ? (
            <Button variant="warning" onClick={() => setShowConfirm('suspend')} className="!py-2 !px-4 !w-auto text-sm">Suspender</Button>
          ) : tenant.status === 'suspended' ? (
            <Button variant="primary" onClick={() => setShowConfirm('activate')} className="!py-2 !px-4 !w-auto text-sm">Activar</Button>
          ) : null}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant info */}
        <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
          <h2 className="text-base font-semibold text-theme-dark-primary mb-4">Información del Tenant</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'ID', value: <span className="font-mono text-xs">{tenant.id}</span> },
              { label: 'Nombre', value: tenant.name },
              { label: 'Slug', value: <span className="font-mono">{tenant.slug}</span> },
              { label: 'Dominio', value: tenant.domain ?? '—' },
              { label: 'Creado', value: new Date(tenant.createdAt).toLocaleDateString('es-BO') },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-theme-secondary-text">{row.label}</span>
                <span className="font-medium text-theme-primary-text">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription info */}
        <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
          <h2 className="text-base font-semibold text-theme-dark-primary mb-4">Suscripción Actual</h2>
          {activeSub ? (
            <div className="space-y-3 text-sm">
              {[
                { label: 'Plan', value: activeSub.plan?.name ?? '—' },
                { label: 'Precio', value: activeSub.plan ? `Bs ${Number(activeSub.plan.price).toLocaleString()}/mes` : '—' },
                { label: 'Estado', value: <Badge variant={activeSub.status === 'active' ? 'success' : 'warning'} size="sm">{activeSub.status}</Badge> },
                { label: 'Inicio', value: new Date(activeSub.startedAt).toLocaleDateString('es-BO') },
                { label: 'Vence', value: activeSub.expiresAt ? new Date(activeSub.expiresAt).toLocaleDateString('es-BO') : 'Sin vencimiento' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-theme-secondary-text">{row.label}</span>
                  <span className="font-medium text-theme-primary-text">{row.value}</span>
                </div>
              ))}
              {activeSub.paymentNotes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                  <span className="font-semibold">Notas de pago:</span> {activeSub.paymentNotes}
                </div>
              )}
            </div>
          ) : (
            <p className="text-theme-secondary-text text-sm">Sin suscripción activa</p>
          )}
        </div>
      </div>

      {/* Usage stats */}
      <div className="bg-white rounded-2xl shadow-lg border border-theme-divider/20 p-6">
        <h2 className="text-base font-semibold text-theme-dark-primary mb-4">Uso de Recursos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Usuarios', value: tenant._count.users, icon: '👥' },
            { label: 'Pacientes', value: tenant._count.patients, icon: '🏥' },
            { label: 'Productos', value: tenant._count.products ?? '—', icon: '📦' },
            { label: 'Ventas', value: tenant._count.sales ?? '—', icon: '💰' },
          ].map(item => (
            <div key={item.label} className="text-center p-4 bg-theme-light-primary/20 rounded-xl">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-2xl font-bold text-theme-dark-primary">{item.value}</div>
              <div className="text-xs text-theme-secondary-text">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm === 'suspend'}
        title="Suspender Tenant"
        message={`¿Suspender "${tenant.name}"? Los usuarios no podrán acceder hasta que se reactive.`}
        confirmLabel="Suspender"
        variant="warning"
        isLoading={isActioning}
        onConfirm={handleAction}
        onCancel={() => setShowConfirm(null)}
      />
      <ConfirmModal
        isOpen={showConfirm === 'activate'}
        title="Activar Tenant"
        message={`¿Activar "${tenant.name}"? Los usuarios volverán a tener acceso.`}
        confirmLabel="Activar"
        variant="default"
        isLoading={isActioning}
        onConfirm={handleAction}
        onCancel={() => setShowConfirm(null)}
      />
    </div>
  );
};
