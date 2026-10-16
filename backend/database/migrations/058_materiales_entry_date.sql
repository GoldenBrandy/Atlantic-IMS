-- Fecha de ingreso del material al inventario, distinta de la fecha de
-- compra (ej. un material donado o registrado despues de haberse comprado).
ALTER TABLE materiales ADD COLUMN IF NOT EXISTS entry_date DATE;
