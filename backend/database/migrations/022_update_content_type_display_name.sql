-- database/migrations/022_update_content_type_display_name.sql
-- Actualizar nombres amigables de content_type.

UPDATE content_type
SET display_name = 
    CASE app_label
        WHEN 'users' THEN 'Usuarios'
        WHEN 'groups' THEN 'Grupos'
        WHEN 'tasks' THEN 'Tareas'
        WHEN 'permissions' THEN 'Permisos'
        ELSE display_name
END;
