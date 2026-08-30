-- database/migrations/021_add_display_name_to_content_type.sql
-- Nombre amigable para mostrar modulos.

ALTER TABLE content_type
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) NOT NULL DEFAULT '';

UPDATE content_type
SET display_name = CASE app_label
    WHEN 'users' THEN 'Usuarios'
    WHEN 'groups' THEN 'Grupos'
    WHEN 'tasks' THEN 'Tareas'
    WHEN 'permissions' THEN 'Permisos'
    ELSE display_name
END;
