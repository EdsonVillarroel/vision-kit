import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface QuickAction {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Nueva venta',
    description: 'Registrar una venta',
    to: '/sales/new',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Registrar cliente',
    description: 'Alta rápida de cliente',
    to: '/patients/new',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    label: 'Registrar medida',
    description: 'Nuevo examen / medida',
    to: '/clinical-exams/new',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

/**
 * Acceso directo global (speed-dial). Siempre disponible para no navegar
 * modulo por modulo: nueva venta, registrar cliente, registrar medida.
 */
export const QuickActionsFab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  // En pantallas de alta/edición ya hay una barra de acción propia (Guardar):
  // el FAB sería redundante y podría taparla, así que se oculta.
  if (/\/(new|edit)(\/|$)/.test(location.pathname)) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={clsx(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Acciones */}
        <div className="flex flex-col items-end gap-3">
          {ACTIONS.map((action, i) => (
            <button
              key={action.to}
              type="button"
              onClick={() => go(action.to)}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${i * 40}ms` : '0ms' }}
              className={clsx(
                'group flex items-center gap-3 outline-none',
                'transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                open
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-2 opacity-0'
              )}
            >
              <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-theme-primary-text shadow-[0_2px_8px_rgba(16,24,40,0.12)] ring-1 ring-black/[0.06]">
                {action.label}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-theme-primary shadow-[0_2px_8px_rgba(16,24,40,0.12)] ring-1 ring-black/[0.06] transition-transform duration-100 ease-out group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-theme-primary/50">
                {action.icon}
              </span>
            </button>
          ))}
        </div>

        {/* Boton principal */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar acciones rápidas' : 'Acciones rápidas'}
          aria-expanded={open}
          className={clsx(
            'flex h-14 w-14 items-center justify-center rounded-full bg-theme-primary text-theme-text-icons',
            'shadow-[0_4px_16px_rgba(16,24,40,0.24)] outline-none',
            'transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 active:scale-95',
            'focus-visible:ring-2 focus-visible:ring-theme-primary/50 focus-visible:ring-offset-2'
          )}
        >
          <svg
            className={clsx(
              'h-7 w-7 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
              open && 'rotate-45'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </>
  );
};
