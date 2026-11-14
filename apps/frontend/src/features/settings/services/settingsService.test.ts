import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock('../../../lib/api', () => ({ api }));

import { settingsService } from './settingsService';

describe('settingsService', () => {
  beforeEach(() => vi.clearAllMocks());

  // Regresión: Prisma serializa Decimal como "0.13" y mandarlo así a POST /sales daba 400
  it('convierte taxRate de string a número', async () => {
    api.get.mockResolvedValue({ id: '1', name: 'Óptica', taxRate: '0.13' });

    const settings = await settingsService.get();

    expect(settings.taxRate).toBe(0.13);
    expect(typeof settings.taxRate).toBe('number');
  });

  it('deja taxRate undefined si el backend no lo manda', async () => {
    api.get.mockResolvedValue({ id: '1', name: 'Óptica' });
    expect((await settingsService.get()).taxRate).toBeUndefined();
  });

  it('también normaliza la respuesta de update', async () => {
    api.patch.mockResolvedValue({ id: '1', name: 'Óptica', taxRate: '0.15' });
    expect((await settingsService.update({ name: 'Óptica' })).taxRate).toBe(0.15);
  });
});
