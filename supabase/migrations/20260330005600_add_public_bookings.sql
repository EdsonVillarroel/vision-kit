-- Migration: add public_bookings table for online appointment reservations

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE public_bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  service_type   TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  notes          TEXT,
  status         booking_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_bookings_status         ON public_bookings (status);
CREATE INDEX idx_public_bookings_preferred_date ON public_bookings (preferred_date);

-- RLS: solo el backend (service_role) puede leer/escribir
ALTER TABLE public_bookings ENABLE ROW LEVEL SECURITY;

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_public_bookings_updated_at
  BEFORE UPDATE ON public_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
