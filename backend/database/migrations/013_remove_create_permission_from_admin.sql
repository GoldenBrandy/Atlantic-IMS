DELETE FROM group_permissions gp
USING groups g, permissions p
WHERE gp.group_id = g.group_id
  AND gp.permission_id = p.permission_id
  AND g.group_name = 'Administrador'
  AND p.permission_codename = 'create_users';
