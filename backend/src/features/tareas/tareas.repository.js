import { pool } from "../../config/db.js";

// Agrega los usuarios y tipos de usuario asignados consultando las tablas puente.
async function attachAssignments(tarea) {
  if (!tarea) return tarea;
  const [usersResult, typesResult] = await Promise.all([
    pool.query(`SELECT user_id, end_date FROM tarea_usuarios WHERE tarea_id = $1 ORDER BY user_id;`, [tarea.id]),
    pool.query(`SELECT tipo_usuario FROM tarea_tipos_usuario WHERE tarea_id = $1 ORDER BY tipo_usuario;`, [tarea.id]),
  ]);
  const assignedUserEndDates = {};
  usersResult.rows.forEach((row) => {
    assignedUserEndDates[row.user_id] = row.end_date;
  });
  return {
    ...tarea,
    assigned_users: usersResult.rows.map((row) => row.user_id),
    assigned_user_end_dates: assignedUserEndDates,
    assigned_user_types: typesResult.rows.map((row) => row.tipo_usuario),
  };
}

export const tareaRepository = {
  async findAll() {
    const result = await pool.query(`
      SELECT id, task_name, status, start_date, end_date, description, assigned_by, progress, verified_at
      FROM tareas
      ORDER BY id;
    `);
    return Promise.all(result.rows.map(attachAssignments));
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, task_name, status, start_date, end_date, description, assigned_by, progress, verified_at
       FROM tareas WHERE id = $1;`,
      [id],
    );
    return attachAssignments(result.rows[0] ?? null);
  },

  async create(data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertResult = await client.query(
        `INSERT INTO tareas (task_name, status, start_date, end_date, description, assigned_by, progress)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id;`,
        [
          data.taskName, data.status, data.startDate || null, data.endDate || null, data.description || null,
          data.assignedBy || null, data.progress ?? 0,
        ],
      );
      const tareaId = insertResult.rows[0].id;

      for (const userId of data.assignedUsers ?? []) {
        const userEndDate = data.userEndDates?.[userId] || data.endDate || null;
        await client.query(
          `INSERT INTO tarea_usuarios (tarea_id, user_id, end_date) VALUES ($1,$2,$3);`,
          [tareaId, userId, userEndDate],
        );
      }
      for (const tipo of data.assignedUserTypes ?? []) {
        await client.query(
          `INSERT INTO tarea_tipos_usuario (tarea_id, tipo_usuario) VALUES ($1,$2);`,
          [tareaId, tipo],
        );
      }

      await client.query("COMMIT");
      return { id: tareaId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // assigned_by NO se toca aqui a proposito: preserva quien creo/asigno
      // la tarea originalmente (el "remitente"), sin importar quien la edite despues.
      const updateResult = await client.query(
        `UPDATE tareas SET
           task_name = $1, status = $2, start_date = $3, end_date = $4, description = $5, progress = $6
         WHERE id = $7
         RETURNING id;`,
        [data.taskName, data.status, data.startDate || null, data.endDate || null, data.description || null, data.progress ?? 0, id],
      );

      if (updateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(`DELETE FROM tarea_usuarios WHERE tarea_id = $1;`, [id]);
      await client.query(`DELETE FROM tarea_tipos_usuario WHERE tarea_id = $1;`, [id]);

      for (const userId of data.assignedUsers ?? []) {
        const userEndDate = data.userEndDates?.[userId] || data.endDate || null;
        await client.query(
          `INSERT INTO tarea_usuarios (tarea_id, user_id, end_date) VALUES ($1,$2,$3);`,
          [id, userId, userEndDate],
        );
      }
      for (const tipo of data.assignedUserTypes ?? []) {
        await client.query(
          `INSERT INTO tarea_tipos_usuario (tarea_id, tipo_usuario) VALUES ($1,$2);`,
          [id, tipo],
        );
      }

      await client.query("COMMIT");
      return { id };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // Marca la tarea como verificada por el asignador (solo se llama luego de
  // confirmar en el service que quien verifica es el asignador y que la
  // tarea esta "completada").
  async verify(id) {
    const result = await pool.query(
      `UPDATE tareas SET verified_at = NOW() WHERE id = $1 RETURNING id, verified_at;`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  // Asignaciones (tarea + usuario) activas cuya fecha limite efectiva (la
  // propia del usuario si existe, si no la de la tarea) cae dentro de los
  // proximos `daysAhead` dias. Usado para generar recordatorios.
  async findUpcomingAssignments(daysAhead) {
    const result = await pool.query(
      `SELECT
         t.id AS tarea_id, t.task_name, t.status,
         tu.user_id, u.user_name, u.user_email,
         COALESCE(tu.end_date, t.end_date) AS effective_end_date
       FROM tarea_usuarios tu
       JOIN tareas t ON t.id = tu.tarea_id
       JOIN users u ON u.id = tu.user_id
       WHERE t.status NOT IN ('completada', 'cancelada')
         AND COALESCE(tu.end_date, t.end_date) IS NOT NULL
         AND COALESCE(tu.end_date, t.end_date) BETWEEN CURRENT_DATE AND CURRENT_DATE + $1::int;`,
      [daysAhead],
    );
    return result.rows;
  },
};
