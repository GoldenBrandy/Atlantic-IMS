INSERT INTO group_permissions (
    group_id, 
    permission_id
)

SELECT 
    g.group_id,
    p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Administrador'
AND p.permission_codename IN (
    'list_users', 
    'create_users',
    'update_users'
)
ON CONFLICT (group_id, permission_id) DO NOTHING;
