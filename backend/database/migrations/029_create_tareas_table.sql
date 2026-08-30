CREATE TABLE IF NOT EXISTS tareas (
  id SERIAL PRIMARY KEY,
  task_name VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL,
  start_date DATE,
  end_date DATE,
  description VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tarea_usuarios (
  tarea_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (tarea_id, user_id)
);

CREATE TABLE IF NOT EXISTS tarea_tipos_usuario (
  tarea_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
  tipo_usuario VARCHAR(30) NOT NULL,
  PRIMARY KEY (tarea_id, tipo_usuario)
);
