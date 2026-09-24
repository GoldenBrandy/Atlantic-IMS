-- Permite varios cuentadantes por material (antes solo uno, columna
-- materiales.custodian_id). Esa columna se deja intacta sin usar; a partir
-- de ahora la app lee/escribe los cuentadantes por esta tabla puente.
CREATE TABLE IF NOT EXISTS material_custodios (
  material_id INTEGER NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (material_id, user_id)
);

-- Migra el cuentadante individual que ya tuviera cada material a la tabla nueva.
INSERT INTO material_custodios (material_id, user_id)
SELECT id, custodian_id FROM materiales WHERE custodian_id IS NOT NULL
ON CONFLICT DO NOTHING;
