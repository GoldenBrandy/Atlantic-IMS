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
      SELECT id, task_name, status, start_date, end_date, description
      FROM tareas
      ORDER BY id;
    `);
    return Promise.all(result.rows.map(attachAssignments));
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, task_name, status, start_date, end_date, description
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
        `INSERT INTO tareas (task_name, status, start_date, end_date, description)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id;`,
        [data.taskName, data.status, data.startDate || null, data.endDate || null, data.description || null],
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

      const updateResult = await client.query(
        `UPDATE tareas SET
           task_name = $1, status = $2, start_date = $3, end_date = $4, description = $5
         WHERE id = $6
         RETURNING id;`,
        [data.taskName, data.status, data.startDate || null, data.endDate || null, data.description || null, id],
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
};
