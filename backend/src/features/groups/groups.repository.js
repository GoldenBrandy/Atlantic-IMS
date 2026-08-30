// backend/src/features/groups/groups.repository.js

import { pool } from "../../config/db.js";

export const groupsRepository = {
  async getAll() {
    const query = `
      SELECT
        group_id,
        group_name,
        group_code,
        description,
        is_active
      FROM groups
      ORDER BY group_name;
    `;

    const result = await pool.query(query);

    return result.rows;
  },

  async getById(groupId) {
    const result = await pool.query(
      `SELECT group_id, group_name, group_code, description, is_active
       FROM groups WHERE group_id = $1;`,
      [groupId],
    );
    return result.rows[0] ?? null;
  },

  async findCodes() {
    const result = await pool.query(`SELECT group_code FROM groups;`);
    return result.rows.map((row) => row.group_code);
  },

  async create({ name, code, description }) {
    const result = await pool.query(
      `INSERT INTO groups (group_name, group_code, description)
       VALUES ($1,$2,$3)
       RETURNING group_id;`,
      [name, code, description || null],
    );
    return result.rows[0];
  },

  async update(groupId, { name, code, description }) {
    const result = await pool.query(
      `UPDATE groups SET group_name = $1, group_code = $2, description = $3
       WHERE group_id = $4
       RETURNING group_id;`,
      [name, code, description || null, groupId],
    );
    return result.rows[0] ?? null;
  },

  async bulkDisable(ids) {
    const result = await pool.query(
      `UPDATE groups SET is_active = false WHERE group_id = ANY($1::int[]) RETURNING group_id;`,
      [ids],
    );
    return result.rows;
  },

  async setActive(groupId, isActive) {
    const result = await pool.query(
      `UPDATE groups SET is_active = $1 WHERE group_id = $2 RETURNING group_id, is_active;`,
      [isActive, groupId],
    );
    return result.rows[0] ?? null;
  },

  // Obtener permisos de grupo por ID
  async getPermissionsByGroupId(groupId) {
    const query = `
      SELECT
        p.permission_id,
        p.permission_name,
        p.permission_codename
      FROM group_permissions gp
      INNER JOIN permissions p
        ON p.permission_id = gp.permission_id
      WHERE gp.group_id = $1
      ORDER BY p.permission_name;
    `;

    const result = await pool.query(query, [groupId]);

    return result.rows;
  },

  // Actualizar permisos del grupo
  async updatePermissions(groupId, permissionCodenames) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const groupResult = await client.query(
        "SELECT group_id FROM groups WHERE group_id = $1",
        [groupId],
      );

      if (groupResult.rowCount === 0) {
        const error = new Error("El grupo no existe");
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
        "DELETE FROM group_permissions WHERE group_id = $1",
        [groupId],
      );

      for (const permissionId of permissionIds) {
        await client.query(
          `
            INSERT INTO group_permissions (group_id, permission_id)
            VALUES ($1, $2)
          `,
          [groupId, permissionId],
        );
      }

      await client.query("COMMIT");
      return this.getPermissionsByGroupId(groupId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
