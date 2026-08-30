import { pool } from "../../config/db.js";

export const marcaRepository = {
  async findAll() {
    const result = await pool.query(`
      SELECT id, name, status, description
      FROM marcas
      ORDER BY id;
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, status, description FROM marcas WHERE id = $1;`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async create({ name, description }) {
    const result = await pool.query(
      `INSERT INTO marcas (name, description)
       VALUES ($1,$2)
       RETURNING id;`,
      [name, description || null],
    );
    return result.rows[0];
  },

  async update(id, { name, description }) {
    const result = await pool.query(
      `UPDATE marcas SET name = $1, description = $2
       WHERE id = $3
       RETURNING id;`,
      [name, description || null, id],
    );
    return result.rows[0] ?? null;
  },

  async bulkDisable(ids) {
    const result = await pool.query(
      `UPDATE marcas SET status = 'inactivo' WHERE id = ANY($1::int[]) RETURNING id;`,
      [ids],
    );
    return result.rows;
  },

  async setActive(id, isActive) {
    const result = await pool.query(
      `UPDATE marcas SET status = $1 WHERE id = $2 RETURNING id, status;`,
      [isActive ? "activo" : "inactivo", id],
    );
    return result.rows[0] ?? null;
  },
};
