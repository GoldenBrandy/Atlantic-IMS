-- Datos de ejemplo para los modulos recien conectados a la base de datos.
TRUNCATE materiales, productos, marcas, prestamos, tarea_usuarios, tarea_tipos_usuario, tareas, grupo_aprendices_integrantes, grupos_aprendices RESTART IDENTITY CASCADE;

INSERT INTO materiales (name, type, quantity, description, is_active) VALUES
  ('Martillo', 'Devolutivo', 12, NULL, true),
  ('Taladro percutor', 'Devolutivo', 6, NULL, true),
  ('Guantes de nitrilo', 'Consumo', 200, NULL, true),
  ('Casco de seguridad', 'Devolutivo', 15, NULL, true),
  ('Cinta aislante', 'Consumo', 80, NULL, true),
  ('Tijeras industriales', 'Devolutivo', 10, NULL, false),
  ('Papel lija', 'Consumo', 150, NULL, true),
  ('Multimetro digital', 'Devolutivo', 5, NULL, true),
  ('Tapabocas desechables', 'Consumo', 500, NULL, true),
  ('Escuadra metalica', 'Devolutivo', 8, NULL, true);

INSERT INTO marcas (name, code, status, description) VALUES
  ('Dell', 'MRC-001', 'activo', 'Equipos de computo'),
  ('Stanley', 'MRC-002', 'activo', 'Herramientas manuales'),
  ('3M', 'MRC-003', 'inactivo', 'Elementos de proteccion personal');

INSERT INTO grupos_aprendices (group_name, group_code, group_type, group_leader, permissions_scope, level, status, description) VALUES
  ('Soporte Tecnico', 'GRP-001', 'operativo', 2, 'escritura', 'intermedio', 'activo', NULL),
  ('Comite Academico', 'GRP-002', 'academico', 3, 'total', 'avanzado', 'activo', NULL),
  ('Proyecto SENA', 'GRP-003', 'proyecto', 6, 'lectura', 'basico', 'inactivo', NULL);

INSERT INTO grupo_aprendices_integrantes (grupo_id, user_id) VALUES
  (1, 2), (1, 3),
  (2, 3), (2, 6), (2, 7),
  (3, 6), (3, 9);

INSERT INTO productos (name, product_code, type, category, responsible, status, last_movement, location, quantity, supplier, observations) VALUES
  ('Portatil Dell Latitude', 'PRD-001', 'equipo', 'tecnologia', 2, 'activo', 'Entrega a instructor', 'Bodega A', 5, 'Dell Colombia', NULL),
  ('Resma de papel carta', 'PRD-002', 'consumible', 'oficina', 3, 'activo', 'Reabastecimiento', 'Bodega B', 120, 'Papeleria Nacional', NULL),
  ('Multimetro digital', 'PRD-003', 'herramienta', 'laboratorio', 6, 'inactivo', 'En mantenimiento', 'Laboratorio 2', 3, 'ElectroTools', 'En revision por calibracion');

INSERT INTO prestamos (material_type, requesting_user, lending_user, grupo_id, justification, loan_type, start_date, due_date) VALUES
  ('Devolutivo', 2, 3, 1, 'Practica de mantenimiento de equipos en el taller', 'interno', '2026-07-20', '2026-07-22'),
  ('Consumo', 6, 3, 2, 'Elaboracion de material didactico para la ficha', 'externo', '2026-07-21', '2026-07-25');

INSERT INTO tareas (task_name, status, start_date, end_date, description) VALUES
  ('Actualizar inventario de materiales', 'en_progreso', '2026-07-20', '2026-07-24', 'Verificar existencias y registrar novedades en el sistema'),
  ('Elaborar informe de prestamos vencidos', 'pendiente', '2026-07-22', '2026-07-26', 'Consolidar los prestamos con fecha de entrega superada');

INSERT INTO tarea_usuarios (tarea_id, user_id) VALUES
  (1, 2), (1, 3),
  (2, 6);

INSERT INTO tarea_tipos_usuario (tarea_id, tipo_usuario) VALUES
  (1, 'instructor'), (1, 'aprendiz'),
  (2, 'aprendiz');
