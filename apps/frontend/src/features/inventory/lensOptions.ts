import type { LensOptionGroup } from './types';

export const LENS_GROUPS: { value: LensOptionGroup; label: string; placeholder: string }[] = [
  { value: 'design', label: 'Tipo de lente', placeholder: 'Monofocal, Bifocal, Progresivo...' },
  { value: 'material', label: 'Material', placeholder: 'Orgánico blanco, MR8, Policarbonato...' },
  { value: 'treatment', label: 'Tratamiento', placeholder: 'Blue Block, Antirreflejo, Fotocromático...' },
];
