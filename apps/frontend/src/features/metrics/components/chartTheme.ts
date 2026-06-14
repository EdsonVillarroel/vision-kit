// Reads theme CSS variables from :root. Falls back to sensible indigo/purple defaults
// when running in SSR or when the vars are not defined yet.

const FALLBACK = {
  primary: '#4f46e5',
  accent: '#8b5cf6',
  darkPrimary: '#3730a3',
};

const read = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export const getChartColors = () => ({
  primary: read('--color-theme-primary', FALLBACK.primary),
  accent: read('--color-theme-accent', FALLBACK.accent),
  darkPrimary: read('--color-theme-dark-primary', FALLBACK.darkPrimary),
});

// Paleta explícita para categorías / pie (no hardcodea colores de tema)
export const CATEGORICAL_PALETTE = [
  '#4f46e5',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ef4444',
];

export const formatBs = (n: number) =>
  `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
