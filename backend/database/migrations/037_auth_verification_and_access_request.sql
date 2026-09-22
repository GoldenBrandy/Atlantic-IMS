-- Codigo de verificacion para restablecer contrasena olvidada (valido 10
-- minutos, ver RESET_CODE_TTL_MINUTES en auth.service.js) y bandera para
-- forzar el cambio de contrasena en el primer ingreso, cuando el admin
-- registra al usuario y le genera una contrasena automatica.
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- Solicitudes de acceso: quien no tiene cuenta pide registro por este medio
-- (no existe auto-registro publico), y el admin revisa la solicitud y crea
-- el usuario manualmente si corresponde.
CREATE TABLE IF NOT EXISTS access_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);