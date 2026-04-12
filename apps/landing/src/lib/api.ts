import type {
  BookingConfirmation,
  ClinicInfo,
  CreateBookingPayload,
  PaginatedProducts,
  Product,
} from '../types';

const BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api/v1';

// ── Helpers ───────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : `Error ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message)
      ? err.message.join('. ')
      : (err.message as string | undefined) ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────

export const publicApi = {
  getCatalog(
    tenantSlug: string,
    params?: {
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedProducts> {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)]),
          ),
        ).toString()
      : '';
    return get<PaginatedProducts>(`/public/${tenantSlug}/catalog${qs}`);
  },

  getProduct(tenantSlug: string, id: string): Promise<Product> {
    return get<Product>(`/public/${tenantSlug}/catalog/${id}`);
  },

  getClinicInfo(tenantSlug: string): Promise<ClinicInfo> {
    return get<ClinicInfo>(`/public/${tenantSlug}/clinic`);
  },

  createBooking(tenantSlug: string, data: CreateBookingPayload): Promise<BookingConfirmation> {
    return post<BookingConfirmation>(`/public/${tenantSlug}/bookings`, data);
  },
};
