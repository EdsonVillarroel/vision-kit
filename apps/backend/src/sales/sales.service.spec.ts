import { SalesService } from './sales.service';

const frame = { id: 'frame', name: 'Montura', sku: 'MON-1', category: 'frames', stock: 5, minStock: 1 };
const lens = { id: 'lens', name: 'MR8', sku: 'LEN-1', category: 'lens_options', stock: 0, minStock: 0 };

describe('SalesService — lentes y materiales', () => {
  const build = () => {
    const client = {
      product: {
        findFirst: jest.fn(({ where }) => [frame, lens].find((p) => p.id === where.id)),
        update: jest.fn(),
      },
      stockMovement: { create: jest.fn() },
      patient: { update: jest.fn() },
      sale: {
        create: jest.fn(({ data }) => ({ id: 'sale', saleNumber: data.saleNumber })),
        update: jest.fn(),
        findFirst: jest.fn(() => ({
          id: 'sale',
          status: 'completed',
          patientId: 'p',
          total: 400,
          saleNumber: 'VTA-1',
          items: [
            { productId: 'frame', quantity: 1 },
            { productId: 'lens', quantity: 1 },
          ],
        })),
      },
    };
    return { client, service: new SalesService({ client } as never) };
  };

  const dto = {
    patientId: 'p',
    date: '2026-10-31',
    tax: 0,
    paymentMethod: 'cash',
    items: [
      { productId: 'frame', quantity: 1, unitPrice: 100 },
      { productId: 'lens', quantity: 1, unitPrice: 300 },
    ],
  } as never;

  it('cobra el lente en la venta pero solo descuenta stock de la montura', async () => {
    const { client, service } = build();

    await service.create(dto, 'seller');

    const { data } = client.sale.create.mock.calls[0][0];
    expect(data.total).toBe(400);
    expect(data.items.create).toHaveLength(2);
    expect(client.product.update).toHaveBeenCalledTimes(1);
    expect(client.product.update.mock.calls[0][0].where.id).toBe('frame');
    expect(client.stockMovement.create).toHaveBeenCalledTimes(1);
  });

  it('calcula el total con descuento por línea, descuento global e IVA', async () => {
    const { client, service } = build();

    await service.create(
      {
        patientId: 'p',
        date: '2026-10-31',
        tax: 0.13,
        discount: 10,
        paymentMethod: 'cash',
        items: [
          { productId: 'frame', quantity: 1, unitPrice: 100, discount: 50 },
          { productId: 'lens', quantity: 1, unitPrice: 300 },
        ],
      } as never,
      'seller',
    );

    // 400 - 50 (línea) - 40 (global 10% del subtotal) = 310; IVA 13% = 40.30
    const { data } = client.sale.create.mock.calls[0][0];
    expect(data.subtotal).toBe(400);
    expect(data.tax).toBeCloseTo(40.3);
    expect(data.total).toBeCloseTo(350.3);
  });

  it('al cancelar solo repone el stock de la montura', async () => {
    const { client, service } = build();

    await service.updateStatus('sale', 'cancelled', 'seller');

    expect(client.product.update).toHaveBeenCalledTimes(1);
    expect(client.product.update.mock.calls[0][0].where.id).toBe('frame');
  });
});
