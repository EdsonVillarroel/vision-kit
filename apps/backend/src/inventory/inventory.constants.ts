import { ProductCategory } from '@prisma/client';

// Lentes y materiales que se fabrican a pedido: se cobran como línea de venta,
// pero no tienen stock, no cuentan para la cuota del plan y no salen en el catálogo público.
export const LENS_OPTIONS_CATEGORY = ProductCategory.lens_options;
