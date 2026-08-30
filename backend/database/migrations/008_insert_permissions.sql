INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
('Listar usuarios', 'list_users', 1),
('Crear usuarios', 'create_users', 1),
('Actualizar usuarios', 'update_users', 1),
('Editar usuarios', 'edit_users', 1),
('Deshabilitar usuarios', 'disable_users', 1),
('Reportar usuarios', 'report_users', 1),
('Listar grupos', 'list_groups', 2)
ON CONFLICT (permission_codename) DO NOTHING;

