import React from 'react';
import { Input } from '../../../components/ui';
import type { DateRange } from '../types';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

type PresetId = 'today' | '7d' | '30d' | 'month';

const pad = (n: number) => String(n).padStart(2, '0');

const toYMD = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const getPresetRange = (preset: PresetId): DateRange => {
  const today = new Date();
  const to = toYMD(today);

  switch (preset) {
    case 'today':
      return { from: to, to };
    case '7d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 6); // últimos 7 días (incluye hoy)
      return { from: toYMD(from), to };
    }
    case '30d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 29); // últimos 30 días (incluye hoy)
      return { from: toYMD(from), to };
    }
    case 'month': {
      // "Este mes" — desde el día 1 del mes actual hasta hoy
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toYMD(from), to };
    }
  }
};

export const getDefaultRange = (): DateRange => getPresetRange('30d');

const presets: Array<{ id: PresetId; label: string }> = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: 'month', label: 'Este mes' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
}) => {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, from: e.target.value });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, to: e.target.value });
  };

  const applyPreset = (id: PresetId) => {
    onChange(getPresetRange(id));
  };

  const activePreset: PresetId | null = React.useMemo(() => {
    for (const p of presets) {
      const r = getPresetRange(p.id);
      if (r.from === value.from && r.to === value.to) return p.id;
    }
    return null;
  }, [value.from, value.to]);

  return (
    <div className="bg-gradient-to-br from-white to-theme-light-primary/10 rounded-2xl shadow-lg p-6 border border-theme-divider/20">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <Input
            type="date"
            label="Desde"
            value={value.from}
            onChange={handleFromChange}
            max={value.to || undefined}
          />
          <Input
            type="date"
            label="Hasta"
            value={value.to}
            onChange={handleToChange}
            min={value.from || undefined}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const isActive = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={
                  isActive
                    ? 'px-4 py-2.5 rounded-full text-sm font-semibold bg-theme-primary text-theme-text-icons shadow-md transition-all duration-300'
                    : 'px-4 py-2.5 rounded-full text-sm font-medium bg-theme-light-primary/40 text-theme-primary border border-theme-primary/20 hover:bg-theme-primary hover:text-theme-text-icons transition-all duration-300'
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
