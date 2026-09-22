import { pool } from "../../config/db.js";

export const authRepository = {
  async findUserByEmail(userEmail) {
    const query = `
            SELECT id, user_name, user_email, password, is_active, is_superuser, must_change_password, reset_code, reset_code_expires_at
            FROM users
            WHERE user_email = $1
            LIMIT 1;
        `;
    const result = await pool.query(query, [userEmail]);
    return result.rows[0];
  },

  // Guarda el codigo de verificacion (y su vencimiento) para restablecer
  // la contrasena olvidada.
  async setResetCode(userId, code, expiresAt) {
    await pool.query(
      `UPDATE users SET reset_code = $1, reset_code_expires_at = $2 WHERE id = $3;`,
      [code, expiresAt, userId],
    );
  },

  //Aplica la nueva contraseña y limpia el código de verificación usado y la bandera de cambio obligatorio (si la tenía)
  async resetPassword(userId, hashedPassword) {
    await pool.query(
      `UPDATE users SET password = $1, reset_code = NULL, reset_code_expires_at = NULL, must_change_password = false WHERE id = $2;`,
      [hashedPassword, userId],
    );
  },

  //Registra una solicitud de acceso (no hay auto-registro publico).
  async createAccessRequest({ fullName, email, reason }) {
    const result = await pool.query(
      `INSERT INTO access_requests (full_name, email, reason) VALUES ($1, $2, $3) RETURNING id;`,
      [fullName, email, reason || null],
    );
    return result.rows[0];
  },
};
