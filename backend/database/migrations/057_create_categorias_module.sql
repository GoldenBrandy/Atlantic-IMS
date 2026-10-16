-- Convierte "categoria" (antes texto libre con opciones fijas, distintas e
-- independientes en materiales y en productos) en un modulo CRUD completo,
-- igual de simple que marcas: id, name, status, description, created_at.

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'activo',
  description VARCHAR(300),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Semilla: union de las opciones fijas que antes tenian materiales
-- (herramienta, tecnologia, mobiliario, audiovisual, laboratorio, seguridad,
-- oficina, otro) y productos (tecnologia, oficina, laboratorio,
-- mantenimiento), mas "General" (habia filas de productos con ese valor
-- legado). Solo se siembra si la tabla esta vacia, para no duplicar si la
-- migracion se vuelve a correr.
INSERT INTO categorias (name)
SELECT v.name FROM (VALUES
  ('Herramienta'), ('Tecnología'), ('Mobiliario'), ('Equipo audiovisual'),
  ('Laboratorio'), ('Seguridad industrial'), ('Oficina'), ('Mantenimiento'),
  ('General'), ('Otro')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM categorias);

-- Reemplaza la columna de texto libre "category" por una FK real.
ALTER TABLE materiales ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;

-- Migra los datos existentes (slug de la opcion fija -> fila real de categorias).
UPDATE materiales m SET categoria_id = c.id
FROM categorias c
WHERE m.categoria_id IS NULL AND m.category IS NOT NULL AND c.name = (
  CASE m.category
    WHEN 'herramienta' THEN 'Herramienta'
    WHEN 'tecnologia' THEN 'Tecnología'
    WHEN 'mobiliario' THEN 'Mobiliario'
    WHEN 'audiovisual' THEN 'Equipo audiovisual'
    WHEN 'laboratorio' THEN 'Laboratorio'
    WHEN 'seguridad' THEN 'Seguridad industrial'
    WHEN 'oficina' THEN 'Oficina'
    WHEN 'otro' THEN 'Otro'
    ELSE m.category
  END
);

UPDATE productos p SET categoria_id = c.id
FROM categorias c
WHERE p.categoria_id IS NULL AND p.category IS NOT NULL AND c.name = (
  CASE p.category
    WHEN 'tecnologia' THEN 'Tecnología'
    WHEN 'oficina' THEN 'Oficina'
    WHEN 'laboratorio' THEN 'Laboratorio'
    WHEN 'mantenimiento' THEN 'Mantenimiento'
    ELSE p.category
  END
);

ALTER TABLE materiales DROP COLUMN IF EXISTS category;
ALTER TABLE productos DROP COLUMN IF EXISTS category;

-- Registra el modulo en permisos, con el mismo patron CRUD de los demas.
INSERT INTO content_type (app_label, model, display_name) VALUES
  ('categorias', 'categoria', 'Categorías')
ON CONFLICT (app_label, model) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.permission_name, v.permission_codename, ct.content_type_id
FROM (VALUES
  ('Listar categorías', 'list_categorias', 'categorias', 'categoria'),
  ('Crear categorías', 'create_categorias', 'categorias', 'categoria'),
  ('Editar categorías', 'edit_categorias', 'categorias', 'categoria'),
  ('Eliminar categorías', 'delete_categorias', 'categorias', 'categoria')
) AS v(permission_name, permission_codename, app_label, model)
JOIN content_type ct ON ct.app_label = v.app_label AND ct.model = v.model
ON CONFLICT (permission_codename) DO NOTHING;
