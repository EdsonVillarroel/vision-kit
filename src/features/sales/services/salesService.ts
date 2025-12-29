import type { Sale, SaleFormData, SalesSummary } from '../types';

const TAX_RATE = 0.16; // IVA 16%

const MOCK_SALES: Sale[] = [
  {
    id: 'SALE001',
    saleNumber: 'VNT-2024-001',
    date: '2024-11-20',
    patientId: '1',
    patientName: 'Juan Pérez',
    items: [
      {
        productId: 'PROD001',
        productName: 'Ray-Ban Wayfarer Classic',
        productSku: 'FRM-RB-5228-001',
        quantity: 1,
        unitPrice: 1500,
        discount: 0,
        subtotal: 1500,
        total: 1500
      },
      {
        productId: 'PROD002',
        productName: 'Lente Monofocal Essilor 1.6',
        productSku: 'LNS-ESS-1.6-AR',
        quantity: 2,
        unitPrice: 900,
        discount: 0,
        subtotal: 1800,
        total: 1800
      }
    ],
    subtotal: 3300,
    discount: 0,
    tax: 528,
    total: 3828,
    paymentMethod: 'card',
    payments: [
      {
        method: 'card',
        amount: 3828,
        reference: 'AUTH-123456'
      }
    ],
    medicalRecordId: 'MR001',
    prescriptionRequired: true,
    status: 'completed',
    soldBy: {
      id: 'USR002',
      name: 'Vendedor 1'
    },
    warrantyInfo: {
      expiryDate: '2025-11-20',
      terms: 'Garantía de 1 año contra defectos de fabricación'
    },
    createdAt: '2024-11-20T11:00:00Z',
    updatedAt: '2024-11-20T11:15:00Z',
    completedAt: '2024-11-20T11:15:00Z'
  },
  {
    id: 'SALE002',
    saleNumber: 'VNT-2024-002',
    date: '2024-11-28',
    patientId: '3',
    patientName: 'Roberto Martínez',
    items: [
      {
        productId: 'PROD004',
        productName: 'Acuvue Oasys 30 Pack',
        productSku: 'CTL-ACU-OASYS-30',
        quantity: 2,
        unitPrice: 750,
        discount: 10,
        subtotal: 1500,
        total: 1350
      },
      {
        productId: 'PROD006',
        productName: 'Opti-Free Solution 360ml',
        productSku: 'SOL-OPTI-360ML',
        quantity: 1,
        unitPrice: 180,
        discount: 0,
        subtotal: 180,
        total: 180
      }
    ],
    subtotal: 1680,
    discount: 150,
    tax: 244.8,
    total: 1774.8,
    paymentMethod: 'cash',
    payments: [
      {
        method: 'cash',
        amount: 1774.8
      }
    ],
    status: 'completed',
    soldBy: {
      id: 'USR002',
      name: 'Vendedor 1'
    },
    notes: 'Cliente habitual, aplicó descuento por volumen',
    createdAt: '2024-11-28T14:00:00Z',
    updatedAt: '2024-11-28T14:10:00Z',
    completedAt: '2024-11-28T14:10:00Z'
  },
  {
    id: 'SALE003',
    saleNumber: 'VNT-2024-003',
    date: '2024-12-01',
    patientId: '2',
    patientName: 'Ana García',
    items: [
      {
        productId: 'PROD003',
        productName: 'Oakley Holbrook Polarizado',
        productSku: 'SUN-OKL-9013',
        quantity: 1,
        unitPrice: 2400,
        discount: 10,
        subtotal: 2400,
        total: 2160
      },
      {
        productId: 'PROD005',
        productName: 'Estuche Rígido Premium',
        productSku: 'ACC-CASE-HARD-001',
        quantity: 1,
        unitPrice: 150,
        discount: 0,
        subtotal: 150,
        total: 150
      }
    ],
    subtotal: 2550,
    discount: 240,
    tax: 369.6,
    total: 2679.6,
    paymentMethod: 'mixed',
    payments: [
      {
        method: 'card',
        amount: 2000,
        reference: 'AUTH-789012'
      },
      {
        method: 'cash',
        amount: 679.6
      }
    ],
    status: 'completed',
    soldBy: {
      id: 'USR003',
      name: 'Vendedor 2'
    },
    warrantyInfo: {
      expiryDate: '2025-12-01',
      terms: 'Garantía de 1 año contra defectos de fabricación'
    },
    createdAt: '2024-12-01T16:00:00Z',
    updatedAt: '2024-12-01T16:20:00Z',
    completedAt: '2024-12-01T16:20:00Z'
  }
];

let sales = [...MOCK_SALES];
let saleCounter = 4;

export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sorted = [...sales].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        resolve(sorted);
      }, 500);
    });
  },

  getById: async (id: string): Promise<Sale | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sale = sales.find(s => s.id === id);
        resolve(sale || null);
      }, 300);
    });
  },

  getByPatientId: async (patientId: string): Promise<Sale[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patientSales = sales
          .filter(s => s.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(patientSales);
      }, 400);
    });
  },

  create: async (data: SaleFormData): Promise<Sale> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Calcular totales
        let subtotal = 0;
        const processedItems = data.items.map(item => {
          const itemSubtotal = item.quantity * item.unitPrice;
          const discountAmount = (itemSubtotal * item.discount) / 100;
          const itemTotal = itemSubtotal - discountAmount;
          subtotal += itemSubtotal;

          return {
            ...item,
            subtotal: itemSubtotal,
            total: itemTotal
          };
        });

        const globalDiscount = data.discount || 0;
        const discountAmount = (subtotal * globalDiscount) / 100;
        const subtotalAfterDiscount = subtotal - discountAmount;
        const tax = subtotalAfterDiscount * TAX_RATE;
        const total = subtotalAfterDiscount + tax;

        const newSale: Sale = {
          id: `SALE${Date.now()}`,
          saleNumber: `VNT-2024-${String(saleCounter++).padStart(3, '0')}`,
          date: new Date().toISOString().split('T')[0],
          patientId: data.patientId,
          patientName: 'Cliente', // En producción, buscar el nombre
          items: processedItems,
          subtotal,
          discount: discountAmount,
          tax,
          total,
          paymentMethod: data.paymentMethod,
          payments: data.payments,
          medicalRecordId: data.medicalRecordId,
          status: 'completed',
          soldBy: data.soldBy,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };

        sales.push(newSale);
        resolve(newSale);
      }, 800);
    });
  },

  cancel: async (id: string, reason: string): Promise<Sale> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = sales.findIndex(s => s.id === id);
        if (index === -1) {
          reject(new Error('Sale not found'));
          return;
        }

        sales[index] = {
          ...sales[index],
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        resolve(sales[index]);
      }, 500);
    });
  },

  refund: async (id: string, reason: string): Promise<Sale> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = sales.findIndex(s => s.id === id);
        if (index === -1) {
          reject(new Error('Sale not found'));
          return;
        }

        sales[index] = {
          ...sales[index],
          status: 'refunded',
          cancellationReason: reason,
          refundedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        resolve(sales[index]);
      }, 500);
    });
  },

  getSummary: async (dateFrom?: string, dateTo?: string): Promise<SalesSummary> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredSales = sales.filter(s => s.status === 'completed');

        if (dateFrom) {
          filteredSales = filteredSales.filter(s => s.date >= dateFrom);
        }
        if (dateTo) {
          filteredSales = filteredSales.filter(s => s.date <= dateTo);
        }

        const totalSales = filteredSales.length;
        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Top productos
        const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
        filteredSales.forEach(sale => {
          sale.items.forEach(item => {
            const current = productSales.get(item.productId) || {
              name: item.productName,
              quantity: 0,
              revenue: 0
            };
            productSales.set(item.productId, {
              name: item.productName,
              quantity: current.quantity + item.quantity,
              revenue: current.revenue + item.total
            });
          });
        });

        const topProducts = Array.from(productSales.entries())
          .map(([id, data]) => ({
            productId: id,
            productName: data.name,
            quantitySold: data.quantity,
            revenue: data.revenue
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        // Ventas por método de pago
        const methodSales = new Map<string, { count: number; amount: number }>();
        filteredSales.forEach(sale => {
          const current = methodSales.get(sale.paymentMethod) || { count: 0, amount: 0 };
          methodSales.set(sale.paymentMethod, {
            count: current.count + 1,
            amount: current.amount + sale.total
          });
        });

        const salesByMethod = Array.from(methodSales.entries()).map(([method, data]) => ({
          method: method as any,
          count: data.count,
          amount: data.amount
        }));

        // Ventas por día
        const daySales = new Map<string, { count: number; amount: number }>();
        filteredSales.forEach(sale => {
          const current = daySales.get(sale.date) || { count: 0, amount: 0 };
          daySales.set(sale.date, {
            count: current.count + 1,
            amount: current.amount + sale.total
          });
        });

        const salesByDay = Array.from(daySales.entries())
          .map(([date, data]) => ({
            date,
            count: data.count,
            amount: data.amount
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        resolve({
          totalSales,
          totalRevenue,
          averageTicket,
          topProducts,
          salesByMethod,
          salesByDay
        });
      }, 600);
    });
  }
};
