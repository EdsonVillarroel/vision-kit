import clsx from 'clsx';

interface DioptryStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Muestra el signo + en positivos (convención óptica para esfera/cilindro/ADD) */
  showSign?: boolean;
  ariaLabel?: string;
  className?: string;
}

const snap = (n: number, step: number) => Number((Math.round(n / step) * step).toFixed(2));

/**
 * Control de valor dióptrico: botones −/+ en pasos de 0.25 y edición directa.
 * Reduce errores de tipeo en esfera/cilindro/ADD. tabular-nums para que no salte.
 */
export const DioptryStepper: React.FC<DioptryStepperProps> = ({
  value,
  onChange,
  step = 0.25,
  min = -30,
  max = 30,
  showSign = true,
  ariaLabel,
  className,
}) => {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, snap(n, step))));

  const display =
    showSign && value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);

  const btn =
    'flex h-10 w-9 shrink-0 items-center justify-center text-lg font-medium text-theme-secondary-text ' +
    'transition-colors duration-100 ease-out hover:bg-theme-light-primary/50 hover:text-theme-dark-primary ' +
    'active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary/40 ' +
    'disabled:opacity-40 disabled:pointer-events-none';

  return (
    <div
      className={clsx(
        'flex items-stretch rounded-lg bg-white ring-1 ring-black/[0.08] overflow-hidden',
        'focus-within:ring-2 focus-within:ring-theme-primary/40',
        className
      )}
    >
      <button type="button" className={btn} onClick={() => set(value - step)} disabled={value <= min} aria-label="Disminuir" tabIndex={-1}>
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.').replace(/[^0-9.+-]/g, '');
          const n = parseFloat(raw);
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          else if (raw === '' || raw === '-' || raw === '+') onChange(0);
        }}
        onBlur={() => set(value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); set(value + step); }
          if (e.key === 'ArrowDown') { e.preventDefault(); set(value - step); }
        }}
        className="w-full min-w-0 border-0 bg-transparent px-1 py-2 text-center text-base font-semibold tnum text-theme-primary-text outline-none"
      />
      <button type="button" className={btn} onClick={() => set(value + step)} disabled={value >= max} aria-label="Aumentar" tabIndex={-1}>
        +
      </button>
    </div>
  );
};
