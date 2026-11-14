export interface SaleLine {
  quantity: number;
  unitPrice: number;
  /** Descuento de la línea en % */
  discount: number;
}

export interface SaleTotals {
  subtotal: number;
  itemDiscounts: number;
  globalDiscountAmount: number;
  totalDiscount: number;
  tax: number;
  total: number;
}

/**
 * Totales de una venta. Debe dar EXACTAMENTE lo mismo que `SalesService.create` en el backend:
 * descuento por línea + descuento global (% del subtotal bruto) y luego IVA sobre la base resultante.
 */
export const calculateSaleTotals = (items: SaleLine[], globalDiscountPct: number, taxRate: number): SaleTotals => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const itemDiscounts = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.discount) / 100, 0);
  const globalDiscountAmount = (subtotal * globalDiscountPct) / 100;
  const taxableBase = subtotal - itemDiscounts - globalDiscountAmount;
  const tax = taxableBase * taxRate;

  return {
    subtotal,
    itemDiscounts,
    globalDiscountAmount,
    totalDiscount: itemDiscounts + globalDiscountAmount,
    tax,
    total: taxableBase + tax,
  };
};
