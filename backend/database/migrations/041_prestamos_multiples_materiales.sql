CREATE TABLE IF NOT EXISTS prestamos_materiales (
  prestamo_id INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
  PRIMARY KEY (prestamo_id, material_id)
);

-- Migra el material_id unico que tenia cada prestamo como su primer (y unico) material.
INSERT INTO prestamos_materiales (prestamo_id, material_id)
SELECT id, material_id FROM prestamos WHERE material_id IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE prestamos DROP COLUMN IF EXISTS material_id;
