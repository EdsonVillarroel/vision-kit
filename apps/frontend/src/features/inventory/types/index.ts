export type ProductCategory =
  | 'frames'
  | 'lenses'
  | 'sunglasses'
  | 'contact-lenses'
  | 'accessories'
  | 'solutions';

export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';

export interface Product {
  id: string;
  sku: string; // Código de producto
  name: string;
  category: ProductCategory;
  brand: string;
  model?: string;
  description?: string;

  // Precios
  costPrice: number; // Precio de costo
  sellingPrice: number; // Precio de venta
  discount?: number; // Descuento en porcentaje

  // Inventario
  stock: number;
  minStock: number; // Stock mínimo para alerta
  maxStock?: number;
  status: ProductStatus;

  // Especificaciones (para marcos y lentes)
  specifications?: {
    // Para marcos
    frameType?: 'full-rim' | 'semi-rimless' | 'rimless';
    material?: string; // Metal, acetato, titanio, etc.
    color?: string;
    size?: {
      lens: number; // Ancho del lente
      bridge: number; // Ancho del puente
      temple: number; // Longitud de la varilla
    };

    // Para lentes
    lensType?: 'single' | 'bifocal' | 'progressive';
    lensMaterial?: 'plastic' | 'polycarbonate' | 'high-index' | 'glass' | string;
    index?: number; // Índice de refracción
    coatings?: string[];

    // Para lentes de contacto
    baseCurve?: number;
    diameter?: number;
    power?: string;
    cylinderRange?: string;
  };

  // Proveedor
  supplier?: {
    id: string;
    name: string;
    contact?: string;
  };

  // Imágenes
  images?: string[];

  createdAt: string;
  updatedAt: string;
  lastRestocked?: string;
}

export interface ProductFormData extends Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string; // ID de venta u orden de compra
  performedBy: {
    id: string;
    name: string;
  };
  notes?: string;
  date: string;
  createdAt: string;
}

export interface InventoryFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  brand?: string;
  search?: string;
  lowStock?: boolean;
}
