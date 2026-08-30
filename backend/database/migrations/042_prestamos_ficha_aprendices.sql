-- "Grupo de aprendices asociado" pasa de ser una relacion con la tabla de
-- roles (groups) a un campo de texto libre: la ficha de formacion del SENA
-- (ej. "2699045"), que no corresponde a ningun rol del sistema.
ALTER TABLE prestamos DROP CONSTRAINT IF EXISTS prestamos_grupo_id_fkey;
ALTER TABLE prestamos DROP COLUMN IF EXISTS grupo_id;
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS ficha VARCHAR(30);
