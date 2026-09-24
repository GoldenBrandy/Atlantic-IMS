import { pool } from "../../config/db.js";

export const settingsRepository = {
  async getSupportEmail() {
    const result = await pool.query("SELECT support_email FROM settings WHERE id = 1;");
    return result.rows[0]?.support_email ?? null;
  },

  async updateSupportEmail(email) {
    const result = await pool.query(
      "UPDATE settings SET support_email = $1 WHERE id = 1 RETURNING support_email;",
      [email],
    );
    return result.rows[0]?.support_email ?? null;
  },
};
