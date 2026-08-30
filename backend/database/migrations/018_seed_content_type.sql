-- database/migrations/018_seed_content_type.sql
-- Registros iniciales de content_type.

INSERT INTO content_type (
    content_type_id,
    app_label,
    model
)
VALUES
    (1, 'users', 'user'),
    (2, 'groups', 'group'),
    (3, 'tasks', 'task'),
    (4, 'access', 'permission')
ON CONFLICT (content_type_id) DO UPDATE
SET
    app_label = EXCLUDED.app_label,
    model = EXCLUDED.model;

SELECT setval(
    pg_get_serial_sequence('content_type', 'content_type_id'),
    (SELECT MAX(content_type_id) FROM content_type)
);
