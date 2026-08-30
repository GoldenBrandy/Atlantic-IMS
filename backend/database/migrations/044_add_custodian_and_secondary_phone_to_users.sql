-- "Es cuentadante": marca si el usuario puede ser elegido como cuentadante de materiales de consumo en otros módulos (ej. materiales).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_custodian BOOLEAN NOT NULL DEFAULT false;

-- Telefono secundario, opcional.
ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20); 