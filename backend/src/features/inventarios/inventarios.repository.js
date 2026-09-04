// El repository encapsula todas las consultas SQL relacionadas con inventarios.
import { pool } from "../../config/db.js";

export const inventariosRepository = {
  async getAll() {
    const result = await pool.query(
      `SELECT id, name, is_active FROM inventarios ORDER BY name;`,
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT id, name, is_active FROM inventarios WHERE id = $1;`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async create({ name }) {
    const result = await pool.query(
      `INSERT INTO inventarios (name) VALUES ($1) RETURNING id;`,
      [name],
    );
    return result.rows[0];
  },

  // is_active NO se toca aqui a proposito: se administra unicamente via
  // bulkDisable/setActive (el switch de la tabla).
  async update(id, { name }) {
    const result = await pool.query(
      `UPDATE inventarios SET name = $1 WHERE id = $2 RETURNING id;`,
      [name, id],
    );
    return result.rows[0] ?? null;
  },

  async bulkDisable(ids) {
    const result = await pool.query(
      `UPDATE inventarios SET is_active = false WHERE id = ANY($1::int[]) RETURNING id;`,
      [ids],
    );
    return result.rows;
  },

  async setActive(id, isActive) {
    const result = await pool.query(
      `UPDATE inventarios SET is_active = $1 WHERE id = $2 RETURNING id, is_active;`,
      [isActive, id],
    );
    return result.rows[0] ?? null;
  },
};