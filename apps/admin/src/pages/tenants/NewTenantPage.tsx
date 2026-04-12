import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '../../features/tenants';
import { usePlans } from '../../features/plans';
import { Button, Input, Card } from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';
import type { CreateTenantData } from '../../features/tenants';

const STEPS = ['Información del Tenant', 'Plan de Suscripción', 'Credenciales Super Admin'];

export const NewTenantPage = () => {
  const navigate = useNavigate();
  const { createTenant } = useTenants();
  const { plans, loading: loadingPlans } = usePlans();
  const { showSnackbar } = useSnackbar();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CreateTenantData>({
    name: '',
    slug: '',
    planId: '',
    superAdminEmail: '',
    superAdminName: '',
    superAdminPassword: '',
    primaryColor: '#4f46e5',
    domain: '',
  });

  const set = (field: keyof CreateTenantData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) errs.name = 'Nombre requerido';
      if (!form.slug.trim()) errs.slug = 'Slug requerido';
      else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'Solo letras minúsculas, números y guiones';
    }
    if (step === 1) {
      if (!form.planId) errs.planId = 'Selecciona un plan';
    }
    if (step === 2) {
      if (!form.superAdminName.trim()) errs.superAdminName = 'Nombre requerido';
      if (!form.superAdminEmail.trim()) errs.superAdminEmail = 'Email requerido';
      if (!form.superAdminPassword || form.superAdminPassword.length < 6) errs.superAdminPassword = 'Mínimo 6 caracteres';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setSaving(true);
    try {
      await createTenant(form);
      showSnackbar('Tenant creado exitosamente', 'success');
      navigate('/tenants');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error al crear tenant', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-dark-primary">Nuevo Tenant</h1>
        <p className="text-theme-secondary-text mt-1">Provisiona una nueva óptica en la plataforma</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((_label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-theme-primary">{STEPS[step]}</p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 0: Tenant Info */}
          {step === 0 && (
            <>
              <Input
                label="Nombre de la Óptica"
                value={form.name}
                onChange={e => {
                  set('name')(e);
                  if (!form.slug || form.slug === autoSlug(form.name)) {
                    setForm(prev => ({ ...prev, name: e.target.value, slug: autoSlug(e.target.value) }));
                  }
                }}
                placeholder="Óptica Visión Clara"
                error={errors.name}
              />
              <Input
                label="Slug (URL identifier)"
                value={form.slug}
                onChange={set('slug')}
                placeholder="vision-clara"
                error={errors.slug}
                helperText="Solo letras minúsculas, números y guiones"
              />
              <Input
                label="Dominio (opcional)"
                value={form.domain ?? ''}
                onChange={set('domain')}
                placeholder="optica-vision-clara.com"
              />
              <div>
                <label className="block text-sm font-medium text-theme-primary-text mb-2">Color primario</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor ?? '#4f46e5'}
                    onChange={set('primaryColor')}
                    className="w-12 h-10 rounded border border-theme-divider cursor-pointer"
                  />
                  <span className="text-sm text-theme-secondary-text font-mono">{form.primaryColor}</span>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Plan */}
          {step === 1 && (
            <div className="space-y-3">
              {loadingPlans ? (
                <div className="text-theme-secondary-text text-sm">Cargando planes...</div>
              ) : (
                plans.map(plan => (
                  <label
                    key={plan.id}
                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      form.planId === plan.id
                        ? 'border-theme-primary bg-theme-light-primary/30'
                        : 'border-theme-divider hover:border-theme-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={form.planId === plan.id}
                      onChange={set('planId')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-theme-dark-primary">{plan.name}</p>
                        <p className="text-sm text-theme-secondary-text mt-1">
                          Hasta {plan.maxUsers ?? '∞'} usuarios · {plan.maxPatients ?? '∞'} pacientes · {plan.maxProducts ?? '∞'} productos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-theme-primary">Bs {Number(plan.price).toLocaleString()}</p>
                        <p className="text-xs text-theme-secondary-text">/mes</p>
                      </div>
                    </div>
                  </label>
                ))
              )}
              {errors.planId && <p className="text-sm text-red-600">{errors.planId}</p>}
            </div>
          )}

          {/* Step 2: Super Admin credentials */}
          {step === 2 && (
            <>
              <Input
                label="Nombre del Super Admin"
                value={form.superAdminName}
                onChange={set('superAdminName')}
                placeholder="Juan Pérez"
                error={errors.superAdminName}
              />
              <Input
                label="Email del Super Admin"
                type="email"
                value={form.superAdminEmail}
                onChange={set('superAdminEmail')}
                placeholder="admin@optica.com"
                error={errors.superAdminEmail}
              />
              <Input
                label="Contraseña inicial"
                type="password"
                value={form.superAdminPassword}
                onChange={set('superAdminPassword')}
                placeholder="••••••••"
                error={errors.superAdminPassword}
                helperText="Mínimo 6 caracteres. El usuario puede cambiarla después."
              />
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button type="button" variant="secondary" onClick={() => setStep(s => s - 1)} className="flex-1">
                Anterior
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="flex-1">
                Siguiente
              </Button>
            ) : (
              <Button type="submit" variant="primary" isLoading={saving} className="flex-1">
                Crear Tenant
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
