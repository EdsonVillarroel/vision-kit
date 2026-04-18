-- Bolivianize clinic_settings defaults
-- Context: Vision Kit target market is Bolivia (BOB currency, 13% IVA).
-- Previous defaults (MXN, 0.16) were from the initial Mexican demo data.
-- Existing rows are NOT updated (leave tenant data intact).

ALTER TABLE clinic_settings
  ALTER COLUMN tax_rate SET DEFAULT 0.13;

ALTER TABLE clinic_settings
  ALTER COLUMN currency SET DEFAULT 'BOB';
