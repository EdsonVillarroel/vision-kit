-- Catálogo de lentes y materiales cobrables en la venta (Blue Block, MR8,
-- Progresivo, etc.). Se fabrican a pedido: viven en `products` sin control de stock.
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'lens-options';
