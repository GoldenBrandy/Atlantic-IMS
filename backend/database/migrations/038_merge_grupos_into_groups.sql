-- El modulo "Grupos" (equipos con lider/integrantes, grupos_aprendices) se
-- fusiona con la tabla de roles "groups" ya usada por Usuarios y Gestion de
-- Permisos. Prestamos referenciaba grupos_aprendices; se repunta a groups.

ALTER TABLE prestamos DROP CONSTRAINT IF EXISTS prestamos_grupo_id_fkey;

-- Los ids de grupos_aprendices no coinciden con los ids de groups: se limpia
-- cualquier referencia que ya no exista antes de aplicar el nuevo FK.
UPDATE prestamos
SET grupo_id = NULL
WHERE grupo_id IS NOT NULL
  AND grupo_id NOT IN (SELECT group_id FROM groups);

ALTER TABLE prestamos
  ADD CONSTRAINT prestamos_grupo_id_fkey
  FOREIGN KEY (grupo_id) REFERENCES groups(group_id) ON DELETE SET NULL;

DROP TABLE IF EXISTS grupo_aprendices_integrantes;
DROP TABLE IF EXISTS grupos_aprendices;
