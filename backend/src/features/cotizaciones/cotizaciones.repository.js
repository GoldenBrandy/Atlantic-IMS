import { pool } from "../../config/db.js";

export const cotizacionRepository = {
  async findAll() {
    const result = await pool.query(`
      SELECT id, name, file_url, quotation_date, status
      FROM cotizaciones
      ORDER BY id;
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, file_url, quotation_date, status FROM cotizaciones WHERE id = $1;`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async create({ name, fileUrl, quotationDate }) {
    const result = await pool.query(
      `INSERT INTO cotizaciones (name, file_url, quotation_date)
       VALUES ($1,$2,$3)
       RETURNING id;`,
      [name, fileUrl, quotationDate || null],
    );
    return result.rows[0];
  },

  // La firma (el PDF) solo se sobreescribe si llega uno nuevo; de lo
  // contrario se conserva el existente (igual que la firma de prestamos).
  async update(id, { name, fileUrl, quotationDate }) {
    const query = fileUrl
      ? `UPDATE cotizaciones SET name = $1, file_url = $2, quotation_date = $3 WHERE id = $4 RETURNING id;`
      : `UPDATE cotizaciones SET name = $1, quotation_date = $2 WHERE id = $3 RETURNING id;`;
    const values = fileUrl ? [name, fileUrl, quotationDate || null, id] : [name, quotationDate || null, id];
    const result = await pool.query(query, values);
    return result.rows[0] ?? null;
  },

  async bulkDisable(ids) {
    const result = await pool.query(
      `UPDATE cotizaciones SET status = 'inactivo' WHERE id = ANY($1::int[]) RETURNING id;`,
      [ids],
    );
    return result.rows;
  },

  async setActive(id, isActive) {
    const result = await pool.query(
      `UPDATE cotizaciones SET status = $1 WHERE id = $2 RETURNING id, status;`,
      [isActive ? "activo" : "inactivo", id],
    );
    return result.rows[0] ?? null;
  },
};
