INSERT INTO users (
	user_name,
	user_email,
	user_phone,
	document_type,
	document_number,
	password,
	avatar_url,
	is_staff,
	is_active,
	is_superuser
)
VALUES (
	'Administrador',
	'admin@sia-class.com',
	NULL,
	'CC',
	'1000000000',
	'$2b$10$88Vgemuvn/Rv3AXWIm8LX./1UIRw5S2hJ3h57KWvU9W6xgzhJ1Rdu',
	NULL,
	TRUE,
	TRUE,
	TRUE
)
ON CONFLICT (user_email) DO NOTHING;