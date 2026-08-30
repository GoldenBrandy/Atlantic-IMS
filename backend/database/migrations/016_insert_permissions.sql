INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES ('Deshabilitar usuarios', 'disable_users', 1)
ON CONFLICT (permission_codename) DO NOTHING;
