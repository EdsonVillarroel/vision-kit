export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check' | 'mixed';
export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface SaleItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Porcentaje
  subtotal: number;
  total: number;
}

export interface Sale {
  id: string;
  saleNumber: string; // Número de venta único
  date: string;

  // Cliente/Paciente
  patientId: string;
  patientName: string;

  // Items
  items: SaleItem[];

  // Totales
  subtotal: number;
  discount: number; // Descuento total aplicado
  tax: number; // IVA u otros impuestos
  total: number;

  // Pago
  paymentMethod: PaymentMethod;
  payments?: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }[];

  // Referencias
  medicalRecordId?: string; // Asociado a una prescripción
  prescriptionRequired?: boolean;

  // Estado
  status: SaleStatus;

  // Empleado que realizó la venta
  soldBy: {
    id: string;
    name: string;
  };

  // Notas
  notes?: string;

  // Garantía
  warrantyInfo?: {
    expiryDate: string;
    terms: string;
  };

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  cancellationReason?: string;
}

export interface SaleFormData {
  patientId: string;
  items: Omit<SaleItem, 'subtotal' | 'total'>[];
  discount?: number;
  paymentMethod: PaymentMethod;
  payments?: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }[];
  medicalRecordId?: string;
  notes?: string;
  soldBy: {
    id: string;
    name: string;
  };
}

export interface SaleFilters {
  dateFrom?: string;
  dateTo?: string;
  patientId?: string;
  status?: SaleStatus;
  soldById?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface SalesSummary {
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
    method: PaymentMethod;
    count: number;
    amount: number;
  }[];
  salesByDay: {
    date: string;
    count: number;
    amount: number;
  }[];
}
