import { pool } from "../../config/db.js";

export const permissionsRepository = {
  async getAll() {
    const query = `
      SELECT
        p.permission_id,
        p.permission_name,
        p.permission_codename,
        p.content_type_id,
        ct.app_label,
        ct.model,
        ct.display_name
      FROM permissions p
      LEFT JOIN content_type ct
        ON ct.content_type_id = p.content_type_id
      ORDER BY p.permission_name;
    `;

    const result = await pool.query(query);
    return result.rows;
  },
};
