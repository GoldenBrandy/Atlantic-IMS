CREATE TABLE IF NOT EXISTS prestamos (
  id SERIAL PRIMARY KEY,
  material_type VARCHAR(30) NOT NULL,
  requesting_user INTEGER REFERENCES users(id) ON DELETE SET NULL,
  lending_user INTEGER REFERENCES users(id) ON DELETE SET NULL,
  grupo_id INTEGER REFERENCES grupos_aprendices(id) ON DELETE SET NULL,
  justification VARCHAR(300),
  loan_type VARCHAR(30) NOT NULL,
  start_date DATE,
  due_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
