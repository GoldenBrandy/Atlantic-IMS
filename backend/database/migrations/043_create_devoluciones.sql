-- El id de una devolucion es el mismo del prestamo que le da origen (relacion
-- 1 a 1): no se genera un id nuevo, se reutiliza prestamo_id como PK.
CREATE TABLE IF NOT EXISTS devoluciones (
  prestamo_id INTEGER PRIMARY KEY REFERENCES prestamos(id) ON DELETE CASCADE,
  returned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  observation VARCHAR(300),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Detalle por material devuelto: cuanto se devolvio y en que estado.
CREATE TABLE IF NOT EXISTS devoluciones_materiales (
  prestamo_id INTEGER NOT NULL REFERENCES devoluciones(prestamo_id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
  quantity_returned INTEGER NOT NULL DEFAULT 0,
  condition VARCHAR(20) NOT NULL,
  PRIMARY KEY (prestamo_id, material_id)
);
