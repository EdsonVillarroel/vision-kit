import { describe, expect, it } from 'vitest';
import { calculateSaleTotals } from './saleTotals';

describe('calculateSaleTotals', () => {
  it('venta simple sin descuentos con IVA 13%', () => {
    const t = calculateSaleTotals([{ quantity: 2, unitPrice: 100, discount: 0 }], 0, 0.13);
    expect(t.subtotal).toBe(200);
    expect(t.totalDiscount).toBe(0);
    expect(t.tax).toBeCloseTo(26);
    expect(t.total).toBeCloseTo(226);
  });

  it('da lo mismo que el backend (sales.service.spec): descuento por línea + global + IVA', () => {
    const t = calculateSaleTotals(
      [
        { quantity: 1, unitPrice: 100, discount: 50 },
        { quantity: 1, unitPrice: 300, discount: 0 },
      ],
      10,
      0.13,
    );
    expect(t.subtotal).toBe(400);
    expect(t.itemDiscounts).toBe(50);
    expect(t.globalDiscountAmount).toBe(40);
    expect(t.tax).toBeCloseTo(40.3);
    expect(t.total).toBeCloseTo(350.3);
  });

  it('caso real verificado en el navegador: montura -10%, progresivo, polarizado, -5% global → Bs 1.895,01', () => {
    const t = calculateSaleTotals(
      [
        { quantity: 1, unitPrice: 900, discount: 10 },
        { quantity: 1, unitPrice: 700, discount: 0 },
        { quantity: 1, unitPrice: 260, discount: 0 },
      ],
      5,
      0.13,
    );
    expect(t.subtotal).toBe(1860);
    expect(t.totalDiscount).toBe(183);
    expect(t.total).toBeCloseTo(1895.01, 2);
  });

  it('sin productos todo es 0', () => {
    expect(calculateSaleTotals([], 10, 0.13).total).toBe(0);
  });
});
