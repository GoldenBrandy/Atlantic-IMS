-- Notificaciones in-app: se llena cuando el asignado ve una tarea (avisa al remitente), cuando se acerca la fecha límite (recordatorio) y cuando el asignador verifica una tarea completada (avisa al asignado).
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    message VARCHAR(300) NOT NULL,
    tarea_id INTEGER REFERENCES tareas(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);