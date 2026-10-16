-- Reemplaza la autoatestacion simple (un boton que cualquiera podia pulsar)
-- por una confirmacion real: se manda un codigo de 8 digitos al correo del
-- solicitante y del prestador, y cada quien lo confirma desde su propio
-- celular. Las columnas *_identity_confirmed de la migracion 050 se
-- mantienen; ahora solo se vuelven true cuando el codigo correcto se valida.
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS requester_otp_code VARCHAR(8);
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS requester_otp_expires_at TIMESTAMP;
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS lender_otp_code VARCHAR(8);
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS lender_otp_expires_at TIMESTAMP;
