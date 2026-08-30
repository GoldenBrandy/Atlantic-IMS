INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES ('Generar reportes', 'generate_reports', 1)
ON CONFLICT (permission_codename) DO NOTHING;
