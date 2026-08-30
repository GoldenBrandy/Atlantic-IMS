-- Registra el resto de modulos de la aplicacion como content_type
-- y les agrega el CRUD basico de permisos (listar, crear, editar, eliminar).

INSERT INTO content_type (app_label, model, display_name) VALUES
  ('materiales', 'material', 'Materiales'),
  ('productos', 'producto', 'Productos'),
  ('marcas', 'marca', 'Marcas'),
  ('prestamos', 'prestamo', 'Préstamos'),
  ('grupos_aprendices', 'grupo_aprendiz', 'Grupos de aprendices'),
  ('tareas', 'tarea', 'Tareas')
ON CONFLICT (app_label, model) DO UPDATE
SET display_name = EXCLUDED.display_name;

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.permission_name, v.permission_codename, ct.content_type_id
FROM (VALUES
  ('Listar materiales', 'list_materiales', 'materiales', 'material'),
  ('Crear materiales', 'create_materiales', 'materiales', 'material'),
  ('Editar materiales', 'edit_materiales', 'materiales', 'material'),
  ('Eliminar materiales', 'delete_materiales', 'materiales', 'material'),

  ('Listar productos', 'list_productos', 'productos', 'producto'),
  ('Crear productos', 'create_productos', 'productos', 'producto'),
  ('Editar productos', 'edit_productos', 'productos', 'producto'),
  ('Eliminar productos', 'delete_productos', 'productos', 'producto'),

  ('Listar marcas', 'list_marcas', 'marcas', 'marca'),
  ('Crear marcas', 'create_marcas', 'marcas', 'marca'),
  ('Editar marcas', 'edit_marcas', 'marcas', 'marca'),
  ('Eliminar marcas', 'delete_marcas', 'marcas', 'marca'),

  ('Listar préstamos', 'list_prestamos', 'prestamos', 'prestamo'),
  ('Crear préstamos', 'create_prestamos', 'prestamos', 'prestamo'),
  ('Editar préstamos', 'edit_prestamos', 'prestamos', 'prestamo'),
  ('Eliminar préstamos', 'delete_prestamos', 'prestamos', 'prestamo'),

  ('Listar grupos de aprendices', 'list_grupos_aprendices', 'grupos_aprendices', 'grupo_aprendiz'),
  ('Crear grupos de aprendices', 'create_grupos_aprendices', 'grupos_aprendices', 'grupo_aprendiz'),
  ('Editar grupos de aprendices', 'edit_grupos_aprendices', 'grupos_aprendices', 'grupo_aprendiz'),
  ('Eliminar grupos de aprendices', 'delete_grupos_aprendices', 'grupos_aprendices', 'grupo_aprendiz'),

  ('Listar tareas', 'list_tareas', 'tareas', 'tarea'),
  ('Crear tareas', 'create_tareas', 'tareas', 'tarea'),
  ('Editar tareas', 'edit_tareas', 'tareas', 'tarea'),
  ('Eliminar tareas', 'delete_tareas', 'tareas', 'tarea')
) AS v(permission_name, permission_codename, app_label, model)
JOIN content_type ct ON ct.app_label = v.app_label AND ct.model = v.model
ON CONFLICT (permission_codename) DO NOTHING;
