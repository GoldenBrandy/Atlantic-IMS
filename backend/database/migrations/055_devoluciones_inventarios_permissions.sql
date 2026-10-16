-- Registra devoluciones e inventarios como content_type y les agrega
-- permisos, para poder controlar el acceso a esos modulos igual que a los
-- demas (materiales, prestamos, etc.) desde la pantalla de Gestion de permisos.
INSERT INTO content_type (app_label, model, display_name) VALUES
  ('devoluciones', 'devolucion', 'Devoluciones'),
  ('inventarios', 'inventario', 'Inventarios')
ON CONFLICT (app_label, model) DO UPDATE
SET display_name = EXCLUDED.display_name;

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.permission_name, v.permission_codename, ct.content_type_id
FROM (VALUES
  -- Una devolucion solo se registra o se consulta, no se edita ni se elimina.
  ('Listar devoluciones', 'list_devoluciones', 'devoluciones', 'devolucion'),
  ('Crear devoluciones', 'create_devoluciones', 'devoluciones', 'devolucion'),

  ('Listar inventarios', 'list_inventarios', 'inventarios', 'inventario'),
  ('Crear inventarios', 'create_inventarios', 'inventarios', 'inventario'),
  ('Editar inventarios', 'edit_inventarios', 'inventarios', 'inventario'),
  ('Eliminar inventarios', 'delete_inventarios', 'inventarios', 'inventario')
) AS v(permission_name, permission_codename, app_label, model)
JOIN content_type ct ON ct.app_label = v.app_label AND ct.model = v.model
ON CONFLICT (permission_codename) DO NOTHING;
