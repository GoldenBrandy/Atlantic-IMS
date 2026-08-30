INSERT INTO user_groups (
    user_id, 
    group_id
)
SELECT u.id, g.group_id
FROM users u
CROSS JOIN groups g
WHERE u.id = 1
AND g.group_name = 'Administrador'
ON CONFLICT (user_id, group_id) DO NOTHING;
