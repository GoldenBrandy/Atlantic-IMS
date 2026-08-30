CREATE TABLE IF NOT EXISTS grupos_aprendices (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(80) NOT NULL,
  group_code VARCHAR(30) NOT NULL,
  group_type VARCHAR(30) NOT NULL,
  group_leader INTEGER REFERENCES users(id) ON DELETE SET NULL,
  permissions_scope VARCHAR(30),
  level VARCHAR(30),
  status VARCHAR(20) NOT NULL,
  description VARCHAR(300),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grupo_aprendices_integrantes (
  grupo_id INTEGER NOT NULL REFERENCES grupos_aprendices(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (grupo_id, user_id)
);
