-- Modulo Inventario: solo agrupa materiales bajo un nombre (ej. "Bodega
-- principal", "Laboratorio 2"). Sigue el mismo patron que marcas.
CREATE TABLE IF NOT EXISTS inventarios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE materiales ADD COLUMN IF NOT EXISTS inventario_id INTEGER REFERENCES inventarios(id) ON DELETE SET NULL;