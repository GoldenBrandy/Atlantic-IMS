import { pool } from "../../config/db.js";

const SELECT_FIELDS = `
  m.id, m.name, m.type, m.quantity, m.description, m.is_active, m.image_url,
  m.technical_sheet_urls, m.quotation_urls, m.sena_plate, m.location, m.purchase_date, m.unit_value, m.total_value,
  m.model, m.category, m.external_id,
  m.marca_id, ma.name AS marca_name,
  m.custodian_id, u.user_name AS custodian_name, u.last_name_1 AS custodian_last_name
`;

export const materialRepository = {
  async findAll() {
    const result = await pool.query(`
      SELECT ${SELECT_FIELDS}
      FROM materiales m
      LEFT JOIN marcas ma ON ma.id = m.marca_id
      LEFT JOIN users u ON u.id = m.custodian_id
      ORDER BY m.id;
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS}
       FROM materiales m
       LEFT JOIN marcas ma ON ma.id = m.marca_id
       LEFT JOIN users u ON u.id = m.custodian_id
       WHERE m.id = $1;`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async create(data) {
    const {
      name, type, quantity, description, isActive, imageUrl,
      technicalSheetUrls, quotationUrls, senaPlate, marcaId, custodianId,
      location, purchaseDate, unitValue, totalValue,
      model, category, externalId,
    } = data;
    const result = await pool.query(
      `INSERT INTO materiales (
         name, type, quantity, description, is_active, image_url,
         technical_sheet_urls, quotation_urls, sena_plate, marca_id, custodian_id,
         location, purchase_date, unit_value, total_value,
         model, category, external_id
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       RETURNING id;`,
      [
        name, type, quantity, description || null, isActive, imageUrl || null,
        technicalSheetUrls?.length ? technicalSheetUrls : null, quotationUrls?.length ? quotationUrls : null, senaPlate || null, marcaId || null, custodianId || null,
        location || null, purchaseDate || null, unitValue ?? null, totalValue ?? null,
        model || null, category || null, externalId || null,
      ],
    );
    return result.rows[0];
  },

  // Nota: is_active NO se toca aqui a proposito (se administra via
  // bulkDisable/setActive) para que editar un material no reactive uno que
  // se habia desactivado desde la tabla.
  async update(id, data) {
    const {
      name, type, quantity, description, imageUrl,
      technicalSheetUrls, quotationUrls, senaPlate, marcaId, custodianId,
      location, purchaseDate, unitValue, totalValue,
      model, category, externalId,
    } = data;
    const result = await pool.query(
      `UPDATE materiales SET
         name = $1, type = $2, quantity = $3, description = $4, image_url = $5,
         technical_sheet_urls = $6, quotation_urls = $7, sena_plate = $8, marca_id = $9, custodian_id = $10,
         location = $11, purchase_date = $12, unit_value = $13, total_value = $14,
         model = $15, category = $16, external_id = $17, width = $18, length = $19, depth = $20
       WHERE id = $21
       RETURNING id;`,
      [
        name, type, quantity, description || null, imageUrl || null,
        technicalSheetUrls?.length ? technicalSheetUrls : null, quotationUrls?.length ? quotationUrls : null, senaPlate || null, marcaId || null, custodianId || null,
        location || null, purchaseDate || null, unitValue ?? null, totalValue ?? null,
        model || null, category || null, externalId || null,
        id,
      ],
    );
    return result.rows[0] ?? null;
  },

  async bulkDisable(ids) {
    const result = await pool.query(
      `UPDATE materiales SET is_active = false WHERE id = ANY($1::int[]) RETURNING id;`,
      [ids],
    );
    return result.rows;
  },

  async setActive(id, isActive) {
    const result = await pool.query(
      `UPDATE materiales SET is_active = $1 WHERE id = $2 RETURNING id, is_active;`,
      [isActive, id],
    );
    return result.rows[0] ?? null;
  },
};
