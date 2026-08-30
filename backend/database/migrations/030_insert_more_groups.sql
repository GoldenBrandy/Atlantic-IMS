INSERT INTO groups (group_name)
VALUES ('Instructor'), ('Aprendiz'), ('Monitor'), ('Invitado')
ON CONFLICT (group_name) DO NOTHING;
