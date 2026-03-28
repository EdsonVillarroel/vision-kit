import { api } from '../../../lib/api';
import type { Product, ProductFormData, StockMovement, InventoryFilters } from '../types';

// ─── Mappers entre valores frontend (hyphen) y backend (underscore) ───────────

type BackendCategory = 'frames' | 'lenses' | 'sunglasses' | 'contact_lenses' | 'accessories' | 'solutions';
type BackendStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

const CATEGORY_TO_FRONTEND: Record<BackendCategory, Product['category']> = {
  frames: 'frames',
  lenses: 'lenses',
  sunglasses: 'sunglasses',
  contact_lenses: 'contact-lenses',
  accessories: 'accessories',
  solutions: 'solutions',
};

const CATEGORY_TO_BACKEND: Record<Product['category'], BackendCategory> = {
  frames: 'frames',
  lenses: 'lenses',
  sunglasses: 'sunglasses',
  'contact-lenses': 'contact_lenses',
  accessories: 'accessories',
  solutions: 'solutions',
};

const STATUS_TO_FRONTEND: Record<BackendStatus, Product['status']> = {
  in_stock: 'in-stock',
  low_stock: 'low-stock',
  out_of_stock: 'out-of-stock',
  discontinued: 'discontinued',
};

const STATUS_TO_BACKEND: Record<Product['status'], BackendStatus> = {
  'in-stock': 'in_stock',
  'low-stock': 'low_stock',
  'out-of-stock': 'out_of_stock',
  discontinued: 'discontinued',
};

// ─── Tipo de respuesta del backend ───────────────────────────────────────────

interface BackendProduct {
  id: string;
  sku: string;
  name: string;
  category: BackendCategory;
  brand: string;
  model?: string;
  costPrice: number;
  sellingPrice: number;
  discount?: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  status: BackendStatus;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  specifications?: {
    frameType?: string;
    material?: string;
    color?: string;
    lensSize?: number;
    bridge?: number;
    temple?: number;
    lensType?: string;
    lensMaterial?: string;
    index?: number;
    coatings?: string[];
    baseCurve?: number;
    diameter?: number;
    power?: string;
  };
  supplier?: {
    id?: string;
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
}

interface BackendStockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  notes?: string;
  date: string;
  createdAt: string;
  performedBy?: { id: string; name: string };
  performedById: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapProduct(b: BackendProduct): Product {
  return {
    id: b.id,
    sku: b.sku,
    name: b.name,
    category: CATEGORY_TO_FRONTEND[b.category] ?? (b.category as Product['category']),
    brand: b.brand,
    model: b.model,
    costPrice: Number(b.costPrice),
    sellingPrice: Number(b.sellingPrice),
    discount: b.discount != null ? Number(b.discount) : undefined,
    stock: b.stock,
    minStock: b.minStock,
    maxStock: b.maxStock,
    status: STATUS_TO_FRONTEND[b.status] ?? (b.status as Product['status']),
    images: b.images,
    specifications: b.specifications
      ? {
          frameType: b.specifications.frameType as ('full-rim' | 'semi-rimless' | 'rimless' | undefined),
          material: b.specifications.material,
          color: b.specifications.color,
          size:
            b.specifications.lensSize != null
              ? {
                  lens: Number(b.specifications.lensSize),
                  bridge: Number(b.specifications.bridge ?? 0),
                  temple: Number(b.specifications.temple ?? 0),
                }
              : undefined,
          lensType: b.specifications.lensType as ('single' | 'bifocal' | 'progressive' | undefined),
          lensMaterial: b.specifications.lensMaterial,
          index: b.specifications.index != null ? Number(b.specifications.index) : undefined,
          coatings: b.specifications.coatings,
          baseCurve: b.specifications.baseCurve != null ? Number(b.specifications.baseCurve) : undefined,
          diameter: b.specifications.diameter != null ? Number(b.specifications.diameter) : undefined,
          power: b.specifications.power,
        }
      : undefined,
    supplier: b.supplier
      ? {
          id: b.supplier.id ?? '',
          name: b.supplier.name,
          contact: b.supplier.contact ?? b.supplier.phone,
        }
      : undefined,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

function mapMovement(b: BackendStockMovement): StockMovement {
  return {
    id: b.id,
    productId: b.productId,
    type: b.type,
    quantity: b.quantity,
    previousStock: b.previousStock,
    newStock: b.newStock,
    reason: b.reason,
    reference: b.reference,
    notes: b.notes,
    date: b.date.split('T')[0],
    createdAt: b.createdAt,
    performedBy: b.performedBy ?? { id: b.performedById, name: '' },
  };
}

function buildProductPayload(data: ProductFormData) {
  return {
    sku: data.sku,
    name: data.name,
    category: CATEGORY_TO_BACKEND[data.category],
    brand: data.brand,
    model: data.model,
    costPrice: data.costPrice,
    sellingPrice: data.sellingPrice,
    discount: data.discount,
    stock: data.stock,
    minStock: data.minStock,
    maxStock: data.maxStock,
    images: data.images,
    specifications: data.specifications
      ? {
          frameType: data.specifications.frameType,
          material: data.specifications.material,
          color: data.specifications.color,
          lensSize: data.specifications.size?.lens,
          bridge: data.specifications.size?.bridge,
          temple: data.specifications.size?.temple,
          lensType: data.specifications.lensType,
          lensMaterial: data.specifications.lensMaterial,
          index: data.specifications.index,
          coatings: data.specifications.coatings,
          baseCurve: data.specifications.baseCurve,
          diameter: data.specifications.diameter,
          power: data.specifications.power,
        }
      : undefined,
    supplier: data.supplier
      ? {
          name: data.supplier.name,
          contact: data.supplier.contact,
        }
      : undefined,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const inventoryService = {
  getAllProducts: async (filters?: InventoryFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', CATEGORY_TO_BACKEND[filters.category]);
    if (filters?.status) params.set('status', STATUS_TO_BACKEND[filters.status]);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await api.get<BackendProduct[]>(`/inventory${qs}`);
    return data.map(mapProduct);
  },

  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const data = await api.get<BackendProduct>(`/inventory/${id}`);
      return mapProduct(data);
    } catch {
      return null;
    }
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const data = await api.get<BackendProduct[]>(
      `/inventory?search=${encodeURIComponent(query)}`
    );
    return data.map(mapProduct);
  },

  getProductsByCategory: async (category: Product['category']): Promise<Product[]> => {
    return inventoryService.getAllProducts({ category });
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    const data = await api.get<BackendProduct[]>('/inventory/alerts');
    return data.map(mapProduct);
  },

  createProduct: async (data: ProductFormData): Promise<Product> => {
    const result = await api.post<BackendProduct>('/inventory', buildProductPayload(data));
    return mapProduct(result);
  },

  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    const result = await api.patch<BackendProduct>(
      `/inventory/${id}`,
      buildProductPayload(data as ProductFormData)
    );
    return mapProduct(result);
  },

  deleteProduct: async (id: string): Promise<void> => {
    return api.delete(`/inventory/${id}`);
  },

  adjustStock: async (
    productId: string,
    quantity: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string,
    _performedBy: { id: string; name: string },
    reference?: string,
    notes?: string
  ): Promise<StockMovement> => {
    const result = await api.post<BackendStockMovement>(`/inventory/${productId}/adjust`, {
      type,
      quantity,
      reason,
      reference,
      notes,
    });
    return mapMovement(result);
  },

  getStockMovements: async (productId?: string): Promise<StockMovement[]> => {
    if (productId) {
      const data = await api.get<BackendStockMovement[]>(`/inventory/${productId}/movements`);
      return data.map(mapMovement);
    }
    // Si no hay productId, no hay un endpoint global; retorna vacío o filtra por producto conocido
    return [];
  },
};
