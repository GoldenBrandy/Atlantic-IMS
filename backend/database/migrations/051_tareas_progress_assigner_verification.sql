-- Quien asigna la tarea (el remitente), el progreso (0-100) y el momento en que el asignador verifica una tarea completada.
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;