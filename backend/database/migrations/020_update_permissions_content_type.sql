-- database/migrations/020_update_permissions_content_type.sql
-- Asociar todos los permisos existentes al content type users.user.

UPDATE permissions
SET content_type_id = 1
WHERE content_type_id IS DISTINCT FROM 1;
