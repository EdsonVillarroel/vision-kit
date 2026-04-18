import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BOOLEAN_FEATURE_KEYS,
  NUMBER_FEATURE_KEYS,
  SELECT_FEATURE_KEYS,
  booleanFeatureLabels,
  numberFeatureLabels,
  selectFeatureLabels,
  selectFeatureOptions,
  usePlan,
  usePlans,
} from '../../features/plans';
import type {
  BillingPeriod,
  BooleanFeatureKey,
  NumberFeatureKey,
  PlanFeatures,
  SelectFeatureKey,
  SubscriptionPlan,
  UpdatePlanData,
} from '../../features/plans';
import {
  Button,
  Card,
  Input,
  SkeletonFormCard,
} from '../../components/ui';
import { useSnackbar } from '../../components/Snackbar';

// ─── Form state shape ──────────────────────────────────────────────────────
// Mantenemos los campos numéricos como string para permitir borrar el input
// y escribir libremente "-1"; parseamos al guardar.
interface PlanFormState {
  name: string;
  slug: string;
  price: string;
  currency: string;
  billingPeriod: BillingPeriod;
  sortOrder: string;
  isActive: boolean;
  maxUsers: string;
  maxPatients: string;
  maxProducts: string;
  maxStorageMb: string;
  features: PlanFeatures;
}

const initialForm = (plan: SubscriptionPlan): PlanFormState => ({
  name: plan.name,
  slug: plan.slug,
  price: String(plan.price ?? 0),
  currency: plan.currency ?? 'BOB',
  billingPeriod: plan.billingPeriod,
  sortOrder: String(plan.sortOrder ?? 0),
  isActive: plan.isActive,
  maxUsers: String(plan.maxUsers ?? 0),
  maxPatients: String(plan.maxPatients ?? 0),
  maxProducts: String(plan.maxProducts ?? 0),
  maxStorageMb: String(plan.maxStorageMb ?? 0),
  features: { ...(plan.features ?? {}) },
});

const parseInt10 = (s: string): number => {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
};

const parsePrice = (s: string): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

// ─── Sección colapsable reutilizable ───────────────────────────────────────
interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const AccordionSection = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: AccordionSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-theme-divider/40 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-theme-light-primary/30 hover:bg-theme-light-primary/50 transition-colors"
      >
        <div className="text-left">
          <div className="font-semibold text-theme-dark-primary">{title}</div>
          {subtitle && (
            <div className="text-xs text-theme-secondary-text mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        <span
          className={`transition-transform text-theme-primary ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && <div className="p-5 bg-white">{children}</div>}
    </div>
  );
};

// ─── Página ────────────────────────────────────────────────────────────────
export const EditPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plan, loading, error } = usePlan(id);
  const { updatePlan } = usePlans();
  const { showSnackbar } = useSnackbar();

  const [form, setForm] = useState<PlanFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof PlanFormState, string>>
  >({});

  useEffect(() => {
    if (plan) setForm(initialForm(plan));
  }, [plan]);

  const totalFeatureCount = useMemo(
    () =>
      BOOLEAN_FEATURE_KEYS.length +
      NUMBER_FEATURE_KEYS.length +
      SELECT_FEATURE_KEYS.length,
    [],
  );

  if (loading || !form) return <SkeletonFormCard />;
  if (error || !plan) {
    return (
      <div className="text-red-500 p-4">{error ?? 'Plan no encontrado'}</div>
    );
  }

  const setField = <K extends keyof PlanFormState>(
    key: K,
    value: PlanFormState[K],
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const setBooleanFeature = (key: BooleanFeatureKey, value: boolean) => {
    setForm((prev) =>
      prev ? { ...prev, features: { ...prev.features, [key]: value } } : prev,
    );
  };

  const setNumberFeature = (key: NumberFeatureKey, raw: string) => {
    // Guardamos el string en un shadow state sería más limpio, pero para no
    // añadir complejidad aceptamos el parseo inmediato (admite "-1", "0", "".
    const parsed = raw === '' ? undefined : parseInt10(raw);
    setForm((prev) =>
      prev
        ? {
            ...prev,
            features: { ...prev.features, [key]: parsed },
          }
        : prev,
    );
  };

  const setSelectFeature = (key: SelectFeatureKey, value: string) => {
    setForm((prev) =>
      prev ? { ...prev, features: { ...prev.features, [key]: value } } : prev,
    );
  };

  const validate = (f: PlanFormState): boolean => {
    const errs: Partial<Record<keyof PlanFormState, string>> = {};
    if (!f.slug.trim()) errs.slug = 'El slug es obligatorio';
    if (!f.name.trim()) errs.name = 'El nombre es obligatorio';
    const price = parsePrice(f.price);
    if (price < 0) errs.price = 'El precio debe ser ≥ 0';
    for (const key of [
      'maxUsers',
      'maxPatients',
      'maxProducts',
      'maxStorageMb',
    ] as const) {
      const v = parseInt10(f[key]);
      if (v < -1) errs[key] = 'Debe ser ≥ -1 (usa -1 para ilimitado)';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!validate(form)) {
      showSnackbar('Revisa los campos marcados', 'error');
      return;
    }

    setSaving(true);
    try {
      // IMPORTANTE: el backend hace `prisma.update({ data: dto })` que
      // REEMPLAZA completamente el JSON `features`. Por eso enviamos el
      // objeto íntegro (no solo los deltas) — si enviáramos parcial,
      // Prisma reemplazaría el JSON con lo poco que mandemos y perderíamos
      // el resto de los flags.
      const payload: UpdatePlanData = {
        name: form.name.trim(),
        price: parsePrice(form.price),
        currency: form.currency.trim() || 'BOB',
        billingPeriod: form.billingPeriod,
        isActive: form.isActive,
        sortOrder: parseInt10(form.sortOrder),
        maxUsers: parseInt10(form.maxUsers),
        maxPatients: parseInt10(form.maxPatients),
        maxProducts: parseInt10(form.maxProducts),
        maxStorageMb: parseInt10(form.maxStorageMb),
        features: form.features,
      };
      await updatePlan(plan.id, payload);
      showSnackbar('Plan actualizado', 'success');
      navigate('/plans');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/plans')}
          className="text-theme-secondary-text hover:text-theme-primary text-sm mb-2 block transition-colors"
        >
          ← Volver a planes
        </button>
        <h1 className="text-3xl font-bold text-theme-dark-primary">
          Editar Plan
        </h1>
        <p className="text-theme-secondary-text mt-1">
          {plan.name} · <span className="font-mono text-xs">{plan.slug}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Info básica ─────────────────────────────────────────────── */}
        <Card>
          <h2 className="text-lg font-semibold text-theme-dark-primary mb-4">
            Información básica
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                error={validationErrors.name}
                placeholder="Óptica Pro (Mensual)"
              />
              <Input
                label="Slug"
                value={form.slug}
                readOnly
                helperText="No editable después de crear el plan"
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Precio"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                error={validationErrors.price}
              />
              <Input
                label="Moneda"
                value={form.currency}
                onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                placeholder="BOB"
              />
              <div>
                <label className="block text-sm font-medium text-theme-primary-text mb-2">
                  Ciclo de facturación
                </label>
                <select
                  value={form.billingPeriod}
                  onChange={(e) =>
                    setField('billingPeriod', e.target.value as BillingPeriod)
                  }
                  className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:outline-none transition-all"
                >
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <Input
                label="Orden de display (sortOrder)"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField('sortOrder', e.target.value)}
                helperText="Menor = aparece primero"
              />
              <label className="flex items-center gap-3 px-4 py-3 border border-theme-divider rounded-lg bg-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                  className="w-4 h-4 accent-theme-primary"
                />
                <span className="text-sm font-medium text-theme-primary-text">
                  Plan activo (visible para nuevas suscripciones)
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* ─── Límites de recursos ─────────────────────────────────────── */}
        <Card>
          <h2 className="text-lg font-semibold text-theme-dark-primary mb-1">
            Límites de recursos
          </h2>
          <p className="text-xs text-theme-secondary-text mb-4">
            Usa <code className="bg-gray-100 px-1 py-0.5 rounded">-1</code> para
            ilimitado.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Máx. usuarios"
              type="number"
              value={form.maxUsers}
              onChange={(e) => setField('maxUsers', e.target.value)}
              placeholder="-1 para ilimitado"
              error={validationErrors.maxUsers}
            />
            <Input
              label="Máx. pacientes"
              type="number"
              value={form.maxPatients}
              onChange={(e) => setField('maxPatients', e.target.value)}
              placeholder="-1 para ilimitado"
              error={validationErrors.maxPatients}
            />
            <Input
              label="Máx. productos"
              type="number"
              value={form.maxProducts}
              onChange={(e) => setField('maxProducts', e.target.value)}
              placeholder="-1 para ilimitado"
              error={validationErrors.maxProducts}
            />
            <Input
              label="Almacenamiento (MB)"
              type="number"
              value={form.maxStorageMb}
              onChange={(e) => setField('maxStorageMb', e.target.value)}
              placeholder="-1 para ilimitado"
              error={validationErrors.maxStorageMb}
            />
          </div>
        </Card>

        {/* ─── Features ────────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-theme-dark-primary">
                Features del plan
              </h2>
              <p className="text-xs text-theme-secondary-text mt-0.5">
                {totalFeatureCount} flags configurables — se guardan como JSON
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Flags (booleans) */}
            <AccordionSection
              title="Flags (activado / desactivado)"
              subtitle={`${BOOLEAN_FEATURE_KEYS.length} opciones booleanas`}
              defaultOpen
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOOLEAN_FEATURE_KEYS.map((key) => {
                  const meta = booleanFeatureLabels[key];
                  const checked = Boolean(form.features[key]);
                  return (
                    <label
                      key={key}
                      className="flex items-start gap-3 p-3 border border-theme-divider/60 rounded-lg hover:bg-theme-light-primary/20 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setBooleanFeature(key, e.target.checked)
                        }
                        className="mt-0.5 w-4 h-4 accent-theme-primary flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-theme-primary-text">
                          {meta.label}
                        </div>
                        <div className="text-xs text-theme-secondary-text mt-0.5">
                          {meta.help}
                        </div>
                        <div className="text-[10px] text-theme-secondary-text/70 mt-1 font-mono">
                          {key}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </AccordionSection>

            {/* Numbers (cuotas) */}
            <AccordionSection
              title="Cuotas numéricas"
              subtitle={`${NUMBER_FEATURE_KEYS.length} límites — usa -1 para ilimitado`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {NUMBER_FEATURE_KEYS.map((key) => {
                  const meta = numberFeatureLabels[key];
                  const raw = form.features[key];
                  const value = raw === undefined || raw === null ? '' : String(raw);
                  return (
                    <Input
                      key={key}
                      label={meta.label}
                      type="number"
                      value={value}
                      onChange={(e) => setNumberFeature(key, e.target.value)}
                      helperText={`${meta.help} · -1 = ilimitado`}
                      placeholder="-1 para ilimitado"
                    />
                  );
                })}
              </div>
            </AccordionSection>

            {/* Selects */}
            <AccordionSection
              title="Niveles y opciones"
              subtitle={`${SELECT_FEATURE_KEYS.length} selects — valores enumerados`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SELECT_FEATURE_KEYS.map((key) => {
                  const meta = selectFeatureLabels[key];
                  const options = selectFeatureOptions[key];
                  const value =
                    typeof form.features[key] === 'string'
                      ? (form.features[key] as string)
                      : '';
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-theme-primary-text mb-2">
                        {meta.label}
                      </label>
                      <select
                        value={value}
                        onChange={(e) => setSelectFeature(key, e.target.value)}
                        className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:outline-none transition-all"
                      >
                        <option value="">— Sin definir —</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-theme-secondary-text">
                        {meta.help}
                      </p>
                    </div>
                  );
                })}
              </div>
            </AccordionSection>
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex gap-3 sticky bottom-4 z-10">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/plans')}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            className="flex-1"
          >
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
};
