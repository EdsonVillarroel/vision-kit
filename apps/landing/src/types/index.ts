// ── Productos ─────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'frames'
  | 'lenses'
  | 'sunglasses'
  | 'contact-lenses'
  | 'accessories'
  | 'solutions';

export interface ProductSpec {
  frameType?: string;
  material?: string;
  color?: string;
  lensSize?: number;
  lensType?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  sellingPrice: number;
  images: string[];
  specifications?: ProductSpec;
}

export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Clínica ───────────────────────────────────────────────────────────────

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface ClinicInfo {
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  businessHours?: BusinessHours;
}

// ── Reservas ──────────────────────────────────────────────────────────────

export interface CreateBookingPayload {
  name: string;
  phone: string;
  email?: string;
  serviceType: string;
  preferredDate: string;
  preferredTime?: string;
  notes?: string;
}

export interface BookingConfirmation {
  id: string;
  name: string;
  serviceType: string;
  preferredDate: string;
  preferredTime?: string;
  status: 'pending';
  message: string;
}
