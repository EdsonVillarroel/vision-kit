-- Migration: 014_clinic_settings_colors
-- Add brand color fields to clinic_settings table

ALTER TABLE clinic_settings
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS accent_color  TEXT;
