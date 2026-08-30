-- El formulario de usuario pasa de 4 campos de nombre (nombre1, nombre2,
-- apellido1, apellido2) a solo 2 (Nombres, Apellidos). user_name y
-- last_name_1 ya eran los unicos usados para mostrar el nombre completo
-- (formatUserName), asi que se conservan; los otros dos se eliminan.
ALTER TABLE users
  DROP COLUMN IF EXISTS middle_name,
  DROP COLUMN IF EXISTS last_name_2;
