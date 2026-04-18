import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Button } from '../../../components/ui/Button';
import { ApiError } from '../../../lib/api';
import type { QuotaExceededError, QuotaResource } from '../types';

const RESOURCE_LABELS: Record<QuotaResource, string> = {
  patients: 'pacientes',
  products: 'productos',
  users: 'usuarios',
  sales_per_month: 'ventas este mes',
};

interface QuotaErrorContextType {
  showUpgradeModal: (err: QuotaExceededError) => void;
  handleApiError: (err: unknown) => boolean;
}

const QuotaErrorContext = createContext<QuotaErrorContextType | undefined>(undefined);

// Store como módulo-singleton para que `handleApiError` pueda llamarse desde
// hooks/servicios sin pasar por el contexto en cada capa.
let externalShow: ((err: QuotaExceededError) => void) | null = null;

export const handleApiError = (err: unknown): boolean => {
  if (
    err instanceof ApiError &&
    err.status === 402 &&
    err.body &&
    typeof err.body === 'object' &&
    (err.body as { error?: string }).error === 'PlanQuotaExceeded'
  ) {
    externalShow?.(err.body as QuotaExceededError);
    return true;
  }
  return false;
};

export const QuotaErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [current, setCurrent] = useState<QuotaExceededError | null>(null);

  const showUpgradeModal = useCallback((err: QuotaExceededError) => {
    setCurrent(err);
  }, []);

  // Registrar el setter global solo mientras el provider está montado.
  React.useEffect(() => {
    externalShow = showUpgradeModal;
    return () => {
      if (externalShow === showUpgradeModal) externalShow = null;
    };
  }, [showUpgradeModal]);

  const handleApiErrorMember = useCallback((err: unknown) => handleApiError(err), []);

  const value = useMemo<QuotaErrorContextType>(
    () => ({ showUpgradeModal, handleApiError: handleApiErrorMember }),
    [showUpgradeModal, handleApiErrorMember],
  );

  return (
    <QuotaErrorContext.Provider value={value}>
      {children}
      <UpgradeModal error={current} onClose={() => setCurrent(null)} />
    </QuotaErrorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useQuotaError = (): QuotaErrorContextType => {
  const ctx = useContext(QuotaErrorContext);
  if (!ctx) throw new Error('useQuotaError must be used within a QuotaErrorProvider');
  return ctx;
};

interface UpgradeModalProps {
  error: QuotaExceededError | null;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ error, onClose }) => {
  if (!error) return null;

  const resourceLabel = RESOURCE_LABELS[error.resource] ?? error.resource;
  const ratio = error.limit > 0 ? Math.min(1, error.current / error.limit) : 1;
  const pct = Math.round(ratio * 100);

  const whatsappUrl = `https://wa.me/59168803830?text=${encodeURIComponent(
    `Hola, quiero actualizar mi plan ${error.planSlug}`,
  )}`;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="bg-yellow-100 rounded-xl p-3 shrink-0">
            <svg
              className="w-6 h-6 text-yellow-600"
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
            <h3 className="text-lg font-semibold text-gray-900">
              Límite alcanzado en plan {error.planName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
            <span className="capitalize">{resourceLabel}</span>
            <span>
              {error.current} / {error.limit} <span className="text-gray-400">({pct}%)</span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Contactar soporte por WhatsApp
          </a>
          <Button variant="secondary" onClick={onClose} className="!py-2.5">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
