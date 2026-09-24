-- Tabla de configuracion global de la aplicacion (una sola fila).
-- Por ahora solo guarda el correo de soporte, antes fijo en la variable de
-- entorno SUPPORT_EMAIL, para que un super administrador pueda cambiarlo
-- desde la interfaz sin necesitar acceso al servidor.
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  support_email VARCHAR(255) NOT NULL,
  CONSTRAINT settings_single_row CHECK (id = 1)
);

INSERT INTO settings (id, support_email)
VALUES (1, 'soporte@proyectoformativo.com')
ON CONFLICT (id) DO NOTHING;
