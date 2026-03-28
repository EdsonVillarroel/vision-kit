import { api } from '../../../lib/api';
import type { Sale, SaleFormData, SaleFilters, SalesSummary } from '../types';

// ─── Tipo de respuesta del backend ───────────────────────────────────────────

interface BackendSale {
  id: string;
  saleNumber: string;
  patientId: string;
  soldById: string;
  medicalRecordId?: string;
  date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: Sale['paymentMethod'];
  prescriptionRequired: boolean;
  status: Sale['status'];
  notes?: string;
  warrantyExpiryDate?: string;
  warrantyTerms?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  cancellationReason?: string;

  // Relations
  patient?: { id: string; firstName: string; lastName: string };
  soldBy?: { id: string; name: string };
  items?: {
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    total: number;
  }[];
  payments?: {
    method: Sale['paymentMethod'];
    amount: number;
    reference?: string;
  }[];
}

interface BackendSalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
  salesByMethod: {
    method: Sale['paymentMethod'];
    count: number;
    amount: number;
  }[];
  salesByDay: {
    date: string;
    count: number;
    amount: number;
  }[];
}

// ─── Mapper backend → frontend ───────────────────────────────────────────────

function mapSale(b: BackendSale): Sale {
  return {
    id: b.id,
    saleNumber: b.saleNumber,
    date: b.date.split('T')[0],
    patientId: b.patientId,
    patientName: b.patient
      ? `${b.patient.firstName} ${b.patient.lastName}`
      : '',
    items: (b.items ?? []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      subtotal: Number(item.subtotal),
      total: Number(item.total),
    })),
    subtotal: Number(b.subtotal),
    discount: Number(b.discount),
    tax: Number(b.tax),
    total: Number(b.total),
    paymentMethod: b.paymentMethod,
    payments: b.payments?.map((p) => ({
      method: p.method,
      amount: Number(p.amount),
      reference: p.reference,
    })),
    medicalRecordId: b.medicalRecordId,
    prescriptionRequired: b.prescriptionRequired,
    status: b.status,
    soldBy: b.soldBy ?? { id: b.soldById, name: '' },
    notes: b.notes,
    warrantyInfo:
      b.warrantyExpiryDate
        ? {
            expiryDate: b.warrantyExpiryDate.split('T')[0],
            terms: b.warrantyTerms ?? '',
          }
        : undefined,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    completedAt: b.completedAt,
    cancelledAt: b.cancelledAt,
    refundedAt: b.refundedAt,
    cancellationReason: b.cancellationReason,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const salesService = {
  getAll: async (filters?: SaleFilters): Promise<Sale[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.patientId) params.set('patientId', filters.patientId);
    if (filters?.dateFrom) params.set('from', filters.dateFrom);
    if (filters?.dateTo) params.set('to', filters.dateTo);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await api.get<BackendSale[]>(`/sales${qs}`);
    return data.map(mapSale);
  },

  getById: async (id: string): Promise<Sale | null> => {
    try {
      const data = await api.get<BackendSale>(`/sales/${id}`);
      return mapSale(data);
    } catch {
      return null;
    }
  },

  getByPatientId: async (patientId: string): Promise<Sale[]> => {
    return salesService.getAll({ patientId });
  },

  create: async (data: SaleFormData): Promise<Sale> => {
    const payload = {
      patientId: data.patientId,
      medicalRecordId: data.medicalRecordId,
      date: new Date().toISOString().split('T')[0],
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
      discount: data.discount,
      tax: 0.16,
      paymentMethod: data.paymentMethod,
      payments: data.payments,
      notes: data.notes,
    };
    const result = await api.post<BackendSale>('/sales', payload);
    return mapSale(result);
  },

  cancel: async (id: string, reason: string): Promise<Sale> => {
    const result = await api.patch<BackendSale>(`/sales/${id}/status`, {
      status: 'cancelled',
      reason,
    });
    return mapSale(result);
  },

  refund: async (id: string, reason: string): Promise<Sale> => {
    const result = await api.patch<BackendSale>(`/sales/${id}/status`, {
      status: 'refunded',
      reason,
    });
    return mapSale(result);
  },

  updateStatus: async (id: string, status: Sale['status'], reason?: string): Promise<Sale> => {
    const result = await api.patch<BackendSale>(`/sales/${id}/status`, { status, reason });
    return mapSale(result);
  },

  getSummary: async (dateFrom?: string, dateTo?: string): Promise<SalesSummary> => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return api.get<BackendSalesSummary>(`/sales/summary${qs}`);
  },
};
