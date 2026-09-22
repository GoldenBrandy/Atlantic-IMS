import { pool } from "../../config/db.js";

export const notificationRepository = {
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT id, user_id, type, message, tarea_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50;`,
      [userId],
    );
    return result.rows;
  },

  async create({ userId, type, message, tareaId }) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, message, tarea_id)
       VALUES ($1,$2,$3,$4)
       RETURNING id;`,
      [userId, type, message, tareaId || null],
    );
    return result.rows[0];
  },

  async markAsRead(id, userId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id;`,
      [id, userId],
    );
    return result.rows[0] ?? null;
  },

  async markAllAsRead(userId) {
    await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false;`, [userId]);
  },

  // Evita duplicar el mismo recordatorio/aviso el mismo dia para la misma
  // tarea y usuario (ej. recordatorio de fecha limite).
  async existsToday({ userId, tareaId, type }) {
    const result = await pool.query(
      `SELECT 1 FROM notifications
       WHERE user_id = $1 AND tarea_id = $2 AND type = $3 AND created_at::date = CURRENT_DATE
       LIMIT 1;`,
      [userId, tareaId, type],
    );
    return result.rowCount > 0;
  },
};
