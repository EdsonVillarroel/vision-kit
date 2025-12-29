import type { Product, ProductFormData, StockMovement } from '../types';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'PROD001',
    sku: 'FRM-RB-5228-001',
    name: 'Ray-Ban Wayfarer Classic',
    category: 'frames',
    brand: 'Ray-Ban',
    model: 'RB5228',
    description: 'Marco clásico de acetato, diseño atemporal',
    costPrice: 800,
    sellingPrice: 1500,
    stock: 15,
    minStock: 5,
    maxStock: 30,
    status: 'in-stock',
    specifications: {
      frameType: 'full-rim',
      material: 'Acetato',
      color: 'Negro brillante',
      size: {
        lens: 50,
        bridge: 22,
        temple: 150
      }
    },
    supplier: {
      id: 'SUP001',
      name: 'Luxottica México',
      contact: '555-1000'
    },
    images: ['https://via.placeholder.com/300x200?text=Ray-Ban+Wayfarer'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z',
    lastRestocked: '2024-11-15'
  },
  {
    id: 'PROD002',
    sku: 'LNS-ESS-1.6-AR',
    name: 'Lente Monofocal Essilor 1.6',
    category: 'lenses',
    brand: 'Essilor',
    description: 'Lente monofocal índice 1.6 con antirreflejante',
    costPrice: 450,
    sellingPrice: 900,
    stock: 48,
    minStock: 20,
    status: 'in-stock',
    specifications: {
      lensType: 'single',
      lensMaterial: 'high-index',
      index: 1.6,
      coatings: ['Anti-reflejante', 'UV Protection', 'Scratch resistant']
    },
    supplier: {
      id: 'SUP002',
      name: 'Essilor México',
      contact: '555-2000'
    },
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-12-01T11:20:00Z',
    lastRestocked: '2024-12-01'
  },
  {
    id: 'PROD003',
    sku: 'SUN-OKL-9013',
    name: 'Oakley Holbrook Polarizado',
    category: 'sunglasses',
    brand: 'Oakley',
    model: '9013',
    description: 'Gafas de sol deportivas con lentes polarizados',
    costPrice: 1200,
    sellingPrice: 2400,
    discount: 10,
    stock: 3,
    minStock: 5,
    status: 'low-stock',
    specifications: {
      frameType: 'full-rim',
      material: 'O Matter',
      color: 'Matte Black',
      lensType: 'single',
      coatings: ['Polarizado', 'UV400']
    },
    supplier: {
      id: 'SUP003',
      name: 'Safilo México'
    },
    images: ['https://via.placeholder.com/300x200?text=Oakley+Holbrook'],
    createdAt: '2024-03-05T15:00:00Z',
    updatedAt: '2024-11-28T09:15:00Z'
  },
  {
    id: 'PROD004',
    sku: 'CTL-ACU-OASYS-30',
    name: 'Acuvue Oasys 30 Pack',
    category: 'contact-lenses',
    brand: 'Acuvue',
    model: 'Oasys',
    description: 'Lentes de contacto quincenales, 30 unidades',
    costPrice: 400,
    sellingPrice: 750,
    stock: 25,
    minStock: 10,
    status: 'in-stock',
    specifications: {
      baseCurve: 8.4,
      diameter: 14.0,
      power: '-1.00 a -12.00',
      lensMaterial: 'Silicona hidrogel'
    },
    supplier: {
      id: 'SUP004',
      name: 'Johnson & Johnson Vision'
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-11-20T16:00:00Z',
    lastRestocked: '2024-11-20'
  },
  {
    id: 'PROD005',
    sku: 'ACC-CASE-HARD-001',
    name: 'Estuche Rígido Premium',
    category: 'accessories',
    brand: 'Vision Kit',
    description: 'Estuche rígido para protección de lentes',
    costPrice: 50,
    sellingPrice: 150,
    stock: 100,
    minStock: 30,
    status: 'in-stock',
    specifications: {
      material: 'Plástico rígido',
      color: 'Negro'
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-11-10T10:00:00Z',
    lastRestocked: '2024-11-10'
  },
  {
    id: 'PROD006',
    sku: 'SOL-OPTI-360ML',
    name: 'Opti-Free Solution 360ml',
    category: 'solutions',
    brand: 'Opti-Free',
    description: 'Solución multipropósito para lentes de contacto',
    costPrice: 80,
    sellingPrice: 180,
    stock: 45,
    minStock: 20,
    status: 'in-stock',
    supplier: {
      id: 'SUP005',
      name: 'Alcon México'
    },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-11-25T14:00:00Z',
    lastRestocked: '2024-11-25'
  }
];

const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'MOV001',
    productId: 'PROD001',
    type: 'in',
    quantity: 10,
    previousStock: 5,
    newStock: 15,
    reason: 'Reabastecimiento',
    reference: 'PO-2024-001',
    performedBy: {
      id: 'USR001',
      name: 'Admin Usuario'
    },
    date: '2024-11-15',
    createdAt: '2024-11-15T14:30:00Z'
  },
  {
    id: 'MOV002',
    productId: 'PROD003',
    type: 'out',
    quantity: 1,
    previousStock: 4,
    newStock: 3,
    reason: 'Venta',
    reference: 'SALE-2024-042',
    performedBy: {
      id: 'USR002',
      name: 'Vendedor 1'
    },
    date: '2024-11-28',
    createdAt: '2024-11-28T09:15:00Z'
  }
];

let products = [...MOCK_PRODUCTS];
let movements = [...MOCK_MOVEMENTS];

export const inventoryService = {
  // Productos
  getAllProducts: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...products]), 500);
    });
  },

  getProductById: async (id: string): Promise<Product | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = products.find(p => p.id === id);
        resolve(product || null);
      }, 300);
    });
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = products.filter(p =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.sku.toLowerCase().includes(lowerQuery) ||
          p.brand.toLowerCase().includes(lowerQuery)
        );
        resolve(results);
      }, 400);
    });
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = products.filter(p => p.category === category);
        resolve(results);
      }, 400);
    });
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = products.filter(p => p.stock <= p.minStock);
        resolve(results);
      }, 400);
    });
  },

  createProduct: async (data: ProductFormData): Promise<Product> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const status = data.stock === 0 ? 'out-of-stock' :
                      data.stock <= data.minStock ? 'low-stock' : 'in-stock';

        const newProduct: Product = {
          ...data,
          id: `PROD${Date.now()}`,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        products.push(newProduct);
        resolve(newProduct);
      }, 600);
    });
  },

  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = products.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Product not found'));
          return;
        }

        const updatedStock = data.stock ?? products[index].stock;
        const minStock = data.minStock ?? products[index].minStock;
        const status = updatedStock === 0 ? 'out-of-stock' :
                      updatedStock <= minStock ? 'low-stock' : 'in-stock';

        products[index] = {
          ...products[index],
          ...data,
          status,
          updatedAt: new Date().toISOString()
        };
        resolve(products[index]);
      }, 600);
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = products.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Product not found'));
          return;
        }
        products.splice(index, 1);
        resolve();
      }, 400);
    });
  },

  // Movimientos de inventario
  adjustStock: async (
    productId: string,
    quantity: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string,
    performedBy: { id: string; name: string },
    reference?: string
  ): Promise<StockMovement> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          reject(new Error('Product not found'));
          return;
        }

        const previousStock = product.stock;
        let newStock: number;

        if (type === 'in') {
          newStock = previousStock + quantity;
        } else if (type === 'out') {
          newStock = previousStock - quantity;
          if (newStock < 0) {
            reject(new Error('Insufficient stock'));
            return;
          }
        } else {
          newStock = quantity;
        }

        // Actualizar stock del producto
        product.stock = newStock;
        product.status = newStock === 0 ? 'out-of-stock' :
                        newStock <= product.minStock ? 'low-stock' : 'in-stock';
        product.updatedAt = new Date().toISOString();
        if (type === 'in') {
          product.lastRestocked = new Date().toISOString().split('T')[0];
        }

        // Crear movimiento
        const movement: StockMovement = {
          id: `MOV${Date.now()}`,
          productId,
          type,
          quantity,
          previousStock,
          newStock,
          reason,
          reference,
          performedBy,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };

        movements.push(movement);
        resolve(movement);
      }, 500);
    });
  },

  getStockMovements: async (productId?: string): Promise<StockMovement[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = productId
          ? movements.filter(m => m.productId === productId)
          : movements;
        resolve([...results].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }, 400);
    });
  }
};
