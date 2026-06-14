ALTER TABLE profiles
  ADD COLUMN commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0
  CHECK (commission_rate >= 0 AND commission_rate <= 100);

COMMENT ON COLUMN profiles.commission_rate IS 'Porcentaje de comisión por venta (0-100)';

-- Índice compuesto para queries de reportes de comisiones (tenant + rango fechas + status completed)
CREATE INDEX IF NOT EXISTS idx_sales_tenant_date_status
  ON sales (tenant_id, date, status);
