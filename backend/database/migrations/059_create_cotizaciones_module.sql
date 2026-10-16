-- Convierte "cotizaciones" (antes archivos PDF con precio, subidos de una
-- sola vez dentro del formulario de materiales) en un modulo CRUD propio,
-- reutilizable: se sube una vez y se selecciona en los formularios que la
-- pidan. Ya no se guarda precio.

CREATE TABLE IF NOT EXISTS cotizaciones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  file_url TEXT NOT NULL,
  quotation_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Tabla puente: un material puede tener hasta 3 cotizaciones asociadas
-- (limite que se valida en la aplicacion, igual que material_custodios).
CREATE TABLE IF NOT EXISTS material_cotizaciones (
  material_id INTEGER NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
  cotizacion_id INTEGER NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  PRIMARY KEY (material_id, cotizacion_id)
);

-- Migra las cotizaciones que ya estaban guardadas dentro de
-- materiales.quotations (JSONB con url/valor/fecha) hacia el catalogo
-- nuevo, sin el precio.
DO $$
DECLARE
  rec RECORD;
  item JSONB;
  new_id INTEGER;
  idx INTEGER;
BEGIN
  FOR rec IN SELECT id, quotations FROM materiales WHERE quotations IS NOT NULL LOOP
    idx := 1;
    FOR item IN SELECT * FROM jsonb_array_elements(rec.quotations) LOOP
      INSERT INTO cotizaciones (name, file_url, quotation_date)
      VALUES (
        'Cotización material #' || rec.id || ' (' || idx || ')',
        item->>'url',
        NULLIF(item->>'date', '')::date
      )
      RETURNING id INTO new_id;

      INSERT INTO material_cotizaciones (material_id, cotizacion_id)
      VALUES (rec.id, new_id)
      ON CONFLICT DO NOTHING;

      idx := idx + 1;
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE materiales DROP COLUMN IF EXISTS quotations;

-- Permisos del modulo nuevo, mismo patron CRUD que los demas.
INSERT INTO content_type (app_label, model, display_name) VALUES
  ('cotizaciones', 'cotizacion', 'Cotizaciones')
ON CONFLICT (app_label, model) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.permission_name, v.permission_codename, ct.content_type_id
FROM (VALUES
  ('Listar cotizaciones', 'list_cotizaciones', 'cotizaciones', 'cotizacion'),
  ('Crear cotizaciones', 'create_cotizaciones', 'cotizaciones', 'cotizacion'),
  ('Editar cotizaciones', 'edit_cotizaciones', 'cotizaciones', 'cotizacion'),
  ('Eliminar cotizaciones', 'delete_cotizaciones', 'cotizaciones', 'cotizacion')
) AS v(permission_name, permission_codename, app_label, model)
JOIN content_type ct ON ct.app_label = v.app_label AND ct.model = v.model
ON CONFLICT (permission_codename) DO NOTHING;
