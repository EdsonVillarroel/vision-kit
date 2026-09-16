-- 018_relax_measurement_required
-- Mejora reportada por opticas: reducir campos obligatorios en el registro de
-- medida del cliente (examenes clinicos). La distancia pupilar (DP) y las medidas
-- del armazon pasan a ser OPCIONALES; solo la medida optica (vision de lejos)
-- sigue siendo obligatoria. Los datos del cliente (patients) ya son nullables
-- salvo nombre/apellido; identification_id se autogenera en el service si falta.

ALTER TABLE clinical_exams
  ALTER COLUMN pd_right     DROP NOT NULL,
  ALTER COLUMN pd_left      DROP NOT NULL,
  ALTER COLUMN frame_height DROP NOT NULL,
  ALTER COLUMN frame_right  DROP NOT NULL,
  ALTER COLUMN frame_left   DROP NOT NULL;
