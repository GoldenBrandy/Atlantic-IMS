ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS group_code VARCHAR(30),
  ADD COLUMN IF NOT EXISTS description VARCHAR(300);

-- Genera un codigo para los grupos/roles que ya existian antes de este cambio
-- (los primeros 5 caracteres del nombre en mayusculas, sin espacios).
UPDATE groups
SET group_code = UPPER(LEFT(REGEXP_REPLACE(group_name, '[^a-zA-Z]', '', 'g'), 5))
WHERE group_code IS NULL;
