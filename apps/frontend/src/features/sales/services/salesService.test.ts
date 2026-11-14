import { describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../../lib/api', () => ({ api }));

import { salesService } from './salesService';
import type { SaleFormData } from '../types';

describe('salesService.create', () => {
  it('envía el IVA de la configuración (no un 16% fijo) y solo campos del DTO', async () => {
    api.post.mockResolvedValue({
      id: 's1', saleNumber: 'VTA-1', patientId: 'p1', soldById: 'u1', date: '2026-11-14T00:00:00Z',
      subtotal: '100', discount: '0', tax: '13', total: '113', paymentMethod: 'cash',
      prescriptionRequired: false, status: 'completed', createdAt: '', updatedAt: '', items: [],
    });

    const sale = await salesService.create({
      patientId: 'p1',
      items: [{ productId: 'x', quantity: 1, unitPrice: 100, discount: 0 }],
      discount: 0,
      tax: 0.13,
      paymentMethod: 'cash',
    } as unknown as SaleFormData);

    const [url, payload] = api.post.mock.calls[0];
    expect(url).toBe('/sales');
    expect(payload.tax).toBe(0.13);
    expect(Object.keys(payload).sort()).toEqual(
      ['date', 'discount', 'items', 'medicalRecordId', 'notes', 'patientId', 'paymentMethod', 'payments', 'tax'].sort(),
    );
    // Los Decimal del backend llegan como string y se convierten a número
    expect(sale.total).toBe(113);
  });
});
