-- 009_insert_group.sql

INSERT INTO groups (group_name)
VALUES ('Administrador')
ON CONFLICT (group_name) DO NOTHING;
