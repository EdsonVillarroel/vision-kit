import clsx from 'clsx';

interface DateRangePresetsProps {
  value: { from: string; to: string };
  onChange: (range: { from: string; to: string }) => void;
}

type PresetKey = 'today' | '7d' | '30d' | 'month';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: 'month', label: 'Este mes' },
];

const formatDate = (d: Date): string => d.toISOString().split('T')[0];

const computeRange = (key: PresetKey): { from: string; to: string } => {
  const today = new Date();
  const to = formatDate(today);

  if (key === 'today') {
    return { from: to, to };
  }
  if (key === '7d') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6); // incluye hoy
    return { from: formatDate(from), to };
  }
  if (key === '30d') {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from: formatDate(from), to };
  }
  // month
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: formatDate(from), to };
};

const rangesEqual = (a: { from: string; to: string }, b: { from: string; to: string }) =>
  a.from === b.from && a.to === b.to;

export const DateRangePresets: React.FC<DateRangePresetsProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => {
        const range = computeRange(preset.key);
        const isActive = rangesEqual(range, value);
        return (
          <button
            key={preset.key}
            type="button"
            onClick={() => onChange(range)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-theme-primary to-theme-dark-primary text-white shadow-md shadow-theme-primary/30'
                : 'bg-white text-theme-primary-text border border-theme-divider hover:bg-theme-light-primary/30 hover:text-theme-dark-primary hover:border-theme-primary/30',
            )}
          >
            {preset.label}
          </button>
        );
      })}
      <div className="hidden sm:flex items-center gap-1 ml-2 text-sm text-theme-secondary-text">
        <span>{value.from}</span>
        <span className="opacity-60">→</span>
        <span>{value.to}</span>
      </div>
    </div>
  );
};

export const defaultRange = (): { from: string; to: string } => computeRange('30d');
