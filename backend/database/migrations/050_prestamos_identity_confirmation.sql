-- Confirmación de identidad de ambis participantes al pedir un préstamo (autoatestación simple: cada uno confirma antes de poder guardar).
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS requester_identity_confirmed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS lender_identity_confirmed BOOLEAN NOT NULL DEFAULT false;