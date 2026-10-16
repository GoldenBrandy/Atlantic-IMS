import { pool } from "../../config/db.js";

export const productoRepository = {
  async findCodes() {
    const result = await pool.query(`SELECT product_code FROM productos;`);
    return result.rows.map((row) => row.product_code);
  },

  async findAll() {
    const result = await pool.query(`
      SELECT p.id, p.name, p.product_code, p.type, p.responsible, p.status,
             p.last_movement, p.location, p.quantity, p.supplier, p.observations, p.image_url,
             p.categoria_id, cat.name AS categoria_name
      FROM productos p
      LEFT JOIN categorias cat ON cat.id = p.categoria_id
      ORDER BY p.id;
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT p.id, p.name, p.product_code, p.type, p.responsible, p.status,
              p.last_movement, p.location, p.quantity, p.supplier, p.observations, p.image_url,
              p.categoria_id, cat.name AS categoria_name
       FROM productos p
       LEFT JOIN categorias cat ON cat.id = p.categoria_id
       WHERE p.id = $1;`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async create(data) {
    const {
      name, productCode, type, categoriaId, responsible, status,
      lastMovement, location, quantity, supplier, observations, imageUrl,
    } = data;
    const result = await pool.query(
      `INSERT INTO productos (
         name, product_code, type, categoria_id, responsible, status,
         last_movement, location, quantity, supplier, observations, image_url
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id;`,
      [name, productCode, type, categoriaId || null, responsible || null, status, lastMovement || null, location || null, quantity, supplier || null, observations || null, imageUrl || null],
    );
    return result.rows[0];
  },

  // Nota: status y product_code NO se tocan aqui a proposito. status se
  // administra via bulkDisable/setActive (para que editar un producto no
  // reactive uno que se habia desactivado desde la tabla), y product_code
  // se genera una sola vez al crear y nunca cambia despues.
  async update(id, data) {
    const {
      name, type, categoriaId, responsible,
      lastMovement, location, quantity, supplier, observations, imageUrl,
    } = data;
    const result = await pool.query(
      `UPDATE productos SET
         name = $1, type = $2, categoria_id = $3, responsible = $4,
         last_movement = $5, location = $6, quantity = $7, supplier = $8, observations = $9, image_url = $10
       WHERE id = $11
       RETURNING id;`,
      [name, type, categoriaId || null, responsible || null, lastMovement || null, location || null, quantity, supplier || null, observations || null, imageUrl || null, id],
    );
    return result.rows[0] ?? null;
  },

  async bulkDisable(ids) {
    const result = await pool.query(
      `UPDATE productos SET status = 'inactivo' WHERE id = ANY($1::int[]) RETURNING id;`,
      [ids],
    );
    return result.rows;
  },

  async setActive(id, isActive) {
    const result = await pool.query(
      `UPDATE productos SET status = $1 WHERE id = $2 RETURNING id, status;`,
      [isActive ? "activo" : "inactivo", id],
    );
    return result.rows[0] ?? null;
  },
};
