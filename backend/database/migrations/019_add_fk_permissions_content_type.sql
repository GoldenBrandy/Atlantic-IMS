-- database/migrations/019_add_fk_permissions_content_type.sql
-- Agregar relacion permissions -> content_type.

ALTER TABLE permissions
ADD CONSTRAINT fk_permissions_content_type
FOREIGN KEY (content_type_id)
REFERENCES content_type (content_type_id);
