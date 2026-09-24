-- Correo del solicitante cuando no tiene cuenta en el sistema (requesting_user
-- queda en NULL en ese caso, ya que es un FK opcional a users).
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS requester_email VARCHAR(255);
