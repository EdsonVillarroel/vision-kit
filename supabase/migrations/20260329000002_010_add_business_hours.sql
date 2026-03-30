-- Migration 010: Add business_hours to clinic_settings
ALTER TABLE clinic_settings
  ADD COLUMN IF NOT EXISTS business_hours JSONB;
