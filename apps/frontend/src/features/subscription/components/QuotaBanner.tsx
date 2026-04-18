import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import type { QuotaResource } from '../types';

const WATCHED: QuotaResource[] = ['patients', 'products', 'sales_per_month'];

const LABELS: Record<QuotaResource, string> = {
  patients: 'pacientes',
  products: 'productos',
  users: 'usuarios',
  sales_per_month: 'ventas del mes',
};

const DISMISS_KEY = 'vk.quotaBanner.dismiss';

type DismissState = {
  // Último threshold dismisseado por recurso (0.8 o 0.9).
  // Si el usuario dismissea a 80% pero luego cruza 90%, se re-muestra.
  resources: Partial<Record<QuotaResource, number>>;
};

const readDismiss = (): DismissState => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return { resources: {} };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.resources) return parsed as DismissState;
  } catch {
    // ignore
  }
  return { resources: {} };
};

const writeDismiss = (state: DismissState) => {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

export const QuotaBanner: React.FC = () => {
  const { data, isOverQuota, isNearQuota, usageRatio } = useSubscription();
  const [dismissState, setDismissState] = useState<DismissState>(readDismiss);

  const critical = useMemo(() => {
    if (!data) return null;

    // Over-quota tiene prioridad sobre near-quota.
    const over = WATCHED.filter((r) => isOverQuota(r));
    if (over.length > 0) {
      return {
        level: 'over' as const,
        resource: over.reduce((a, b) => (usageRatio(a) >= usageRatio(b) ? a : b)),
      };
    }

    const near = WATCHED.filter((r) => isNearQuota(r, 0.8));
    if (near.length === 0) return null;

    const top = near.reduce((a, b) => (usageRatio(a) >= usageRatio(b) ? a : b));
    return { level: 'near' as const, resource: top };
  }, [data, isOverQuota, isNearQuota, usageRatio]);

  if (!critical) return null;

  const { level, resource } = critical;
  const ratio = usageRatio(resource);
  const pct = Math.round(ratio * 100);

  if (level === 'over') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-900">
            Alcanzaste el límite de {LABELS[resource]} de tu plan
          </p>
          <p className="text-xs text-red-700">
            Actualiza tu plan para seguir registrando {LABELS[resource]}.
          </p>
        </div>
        <Link
          to="/settings/plan"
          className="shrink-0 text-sm font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
        >
          Ver mi plan
        </Link>
      </div>
    );
  }

  // near-quota: respetar dismiss hasta que cruce el siguiente threshold (0.9).
  const dismissed = dismissState.resources[resource] ?? 0;
  const currentThreshold = ratio >= 0.9 ? 0.9 : 0.8;
  if (dismissed >= currentThreshold) return null;

  const handleDismiss = () => {
    const next: DismissState = {
      resources: { ...dismissState.resources, [resource]: currentThreshold },
    };
    writeDismiss(next);
    setDismissState(next);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-center gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-yellow-900">
          Estás usando el {pct}% de tu cuota de {LABELS[resource]}
        </p>
        <p className="text-xs text-yellow-700">
          Considera actualizar tu plan antes de llegar al límite.
        </p>
      </div>
      <Link
        to="/settings/plan"
        className="shrink-0 text-sm font-semibold text-yellow-800 hover:text-yellow-900 underline underline-offset-2"
      >
        Mi plan
      </Link>
      <button
        onClick={handleDismiss}
        className="shrink-0 w-7 h-7 rounded-md text-yellow-700 hover:bg-yellow-100 transition-colors flex items-center justify-center"
        aria-label="Descartar aviso"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
