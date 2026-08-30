// Importamos el pool de conexión a PostgreSQL.
// Este pool es una instancia compartida configurada en la capa de infraestructura.
import { pool } from "../../config/db.js";


// Exportamos el repositorio de usuarios.
// El repository encapsula todas las consultas SQL relacionadas con users.
export const userRepository = {


  // Método encargado de crear un usuario en la base de datos
  // Recibe un objeto con los datos ya validados y procesados por el service
  async create(userData) {


    // Desestructuramos explícitamente las propiedades esperadas
    // Esto hace el contrato de datos claro y evita acceder a propiedades inexistentes
    const {
      name,
      lastName1,
      userEmail,
      institutionalEmail,
      phone,
      secondaryPhone,
      documentType,
      documentNumber,
      groupId,
      address,
      startDate,
      endDate,
      userPassword,
      avatarUrl,
      isStaff,
      isActive,
      isSuperUser,
      isCustodian,
    } = userData;


    // Definimos la consulta SQL parametrizada
    // Usar placeholders ($1, $2, ...) previene inyecciones SQL
    // RETURNING permite obtener datos generados por la base de datos (id)
    const query = `
      INSERT INTO users (
        user_name,
        last_name_1,
        user_email,
        institutional_email,
        user_phone,
        secondary_phone,
        document_type,
        document_number,
        group_id,
        address,
        start_date,
        end_date,
        password,
        avatar_url,
        is_staff,
        is_active,
        is_superuser,
        is_custodian
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING id;
    `;


    // Array de valores que se pasan al query
    // El orden debe coincidir EXACTAMENTE con los placeholders del SQL
    const values = [
      name,
      lastName1 || null,
      userEmail,
      institutionalEmail || null,
      phone,
      secondaryPhone || null,
      documentType,
      documentNumber,
      groupId || null,
      address || null,
      startDate || null,
      endDate || null,
      userPassword,
      avatarUrl,
      isStaff,
      isActive,
      isSuperUser,
      isCustodian ?? false,
    ];


    // Ejecutamos la consulta usando el pool
    // pool.query retorna un objeto con metadata y filas resultantes
    const result = await pool.query(query, values);


    // Devolvemos únicamente el primer registro retornado
    // En este caso contiene el id del usuario recién creado
    return result.rows[0];
  },


  // Lista todos los usuarios. No devuelve la contrasena por seguridad.
  async findAll() {
    const query = `
      SELECT
        id,
        user_name,
        last_name_1,
        user_email,
        institutional_email,
        user_phone,
        secondary_phone,
        document_type,
        document_number,
        group_id,
        address,
        start_date,
        end_date,
        avatar_url,
        is_staff,
        is_active,
        is_superuser,
        is_custodian
      FROM users
      ORDER BY id;
    `;

    const result = await pool.query(query);
    return result.rows;
  },


  // Busca un usuario por numero de telefono (para validar que no se repita
  // entre usuarios distintos; no hay constraint unico a nivel de BD porque
  // ya existian telefonos duplicados en datos previos).
  async findByPhone(phone, excludeId) {
    const query = excludeId
      ? `SELECT id FROM users WHERE user_phone = $1 AND id != $2 LIMIT 1;`
      : `SELECT id FROM users WHERE user_phone = $1 LIMIT 1;`;
    const values = excludeId ? [phone, excludeId] : [phone];

    const result = await pool.query(query, values);
    return result.rows[0] ?? null;
  },


  // Busca un usuario por su id para precargar el formulario de edicion.
  // No devuelve la contrasena por seguridad.
  async findById(id) {
    const query = `
      SELECT
        id,
        user_name,
        last_name_1,
        user_email,
        institutional_email,
        user_phone,
        secondary_phone,
        document_type,
        document_number,
        group_id,
        address,
        start_date,
        end_date,
        avatar_url,
        is_staff,
        is_active,
        is_superuser,
        is_custodian
      FROM users
      WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  },


  // Actualiza los datos de un usuario existente.
  // La contrasena es opcional: solo se actualiza si se envia un hash nuevo.
  // Nota: is_active NO se toca aqui a proposito. Se administra unicamente
  // via bulkDisable/setActive (switch de la tabla); si el formulario de
  // edicion la reescribiera, cada edicion podria reactivar sin querer a un
  // usuario que se habia desactivado.
  async update(id, userData) {
    const {
      name,
      lastName1,
      userEmail,
      institutionalEmail,
      phone,
      secondaryPhone,
      documentType,
      documentNumber,
      groupId,
      address,
      startDate,
      endDate,
      userPassword,
      avatarUrl,
      isStaff,
      isCustodian,
    } = userData;

    const baseQuery = `
      UPDATE users SET
        user_name = $1,
        last_name_1 = $2,
        user_email = $3,
        institutional_email = $4,
        user_phone = $5,
        secondary_phone = $6,
        document_type = $7,
        document_number = $8,
        group_id = $9,
        address = $10,
        start_date = $11,
        end_date = $12,
        avatar_url = $13,
        is_staff = $14,
        is_custodian = $15
    `;

    const baseValues = [
      name,
      lastName1 || null,
      userEmail,
      institutionalEmail || null,
      phone,
      secondaryPhone || null,
      documentType,
      documentNumber,
      groupId || null,
      address || null,
      startDate || null,
      endDate || null,
      avatarUrl || null,
      isStaff ?? false,
      isCustodian ?? false,
    ];

    // Si se envio una contrasena nueva, se agrega a la consulta.
    // Si no, la contrasena guardada se mantiene intacta.
    const query = userPassword
      ? `${baseQuery}, password = $16 WHERE id = $17 RETURNING id;`
      : `${baseQuery} WHERE id = $16 RETURNING id;`;

    const values = userPassword
      ? [...baseValues, userPassword, id]
      : [...baseValues, id];

    const result = await pool.query(query, values);
    return result.rows[0] ?? null;
  },


  // Deshabilita (is_active = false) varios usuarios a la vez.
  async bulkDisable(ids) {
    const result = await pool.query(
      `UPDATE users SET is_active = false WHERE id = ANY($1::int[]) RETURNING id;`,
      [ids],
    );
    return result.rows;
  },


  // Activa/desactiva un unico usuario (switch individual en la tabla).
  async setActive(id, isActive) {
    const result = await pool.query(
      `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, is_active;`,
      [isActive, id],
    );
    return result.rows[0] ?? null;
  },


  // Obtiene el hash de la contrasena de un usuario (para el cambio de contrasena propia).
  async findPasswordHashById(id) {
    const result = await pool.query(
      `SELECT id, password FROM users WHERE id = $1;`,
      [id],
    );
    return result.rows[0] ?? null;
  },


  // Actualiza unicamente la contrasena de un usuario.
  async updatePassword(id, hashedPassword) {
    const result = await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2 RETURNING id;`,
      [hashedPassword, id],
    );
    return result.rows[0] ?? null;
  },


  // Obtiene los permisos individuales de un usuario (independientes de su grupo).
  async getPermissionsByUserId(userId) {
    const query = `
      SELECT
        p.permission_id,
        p.permission_name,
        p.permission_codename
      FROM user_permissions up
      INNER JOIN permissions p
        ON p.permission_id = up.permission_id
      WHERE up.user_id = $1
      ORDER BY p.permission_name;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  },


  // Reemplaza el conjunto de permisos individuales de un usuario.
  async updatePermissions(userId, permissionCodenames) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const userResult = await client.query(
        "SELECT id FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rowCount === 0) {
        const error = new Error("El usuario no existe");
        error.statusCode = 404;
        throw error;
      }

      let permissionIds = [];

      if (permissionCodenames.length > 0) {
        const permissionsResult = await client.query(
          `
            SELECT permission_id, permission_codename
            FROM permissions
            WHERE permission_codename = ANY($1::text[])
          `,
          [permissionCodenames],
        );

        const foundCodenames = new Set(
          permissionsResult.rows.map(
            (permission) => permission.permission_codename,
          ),
        );
        const invalidCodenames = permissionCodenames.filter(
          (codename) => !foundCodenames.has(codename),
        );

        if (invalidCodenames.length > 0) {
          const error = new Error(
            `Permisos no válidos: ${invalidCodenames.join(", ")}`,
          );
          error.statusCode = 400;
          throw error;
        }

        permissionIds = permissionsResult.rows.map(
          (permission) => permission.permission_id,
        );
      }

      await client.query(
        "DELETE FROM user_permissions WHERE user_id = $1",
        [userId],
      );

      for (const permissionId of permissionIds) {
        await client.query(
          `
            INSERT INTO user_permissions (user_id, permission_id)
            VALUES ($1, $2)
          `,
          [userId, permissionId],
        );
      }

      await client.query("COMMIT");
      return this.getPermissionsByUserId(userId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
