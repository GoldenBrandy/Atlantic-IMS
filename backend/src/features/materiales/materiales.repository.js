import { pool } from "../../config/db.js";

const SELECT_FIELDS = `
  m.id, m.name, m.type, m.quantity, m.description, m.is_active, m.image_urls,
  m.technical_sheet_urls, m.quotations, m.sena_plate, m.location, m.purchase_date, m.unit_value, m.total_value,
  m.model, m.category, m.external_id,
  m.marca_id, ma.name AS marca_name,
  m.inventario_id, inv.name AS inventario_name
`;

// Agrega los ids de los cuentadantes (puede haber varios) consultando la tabla puente.
async function attachCustodians(material) {
  if (!material) return material;
  const result = await pool.query(
    `SELECT user_id FROM material_custodios WHERE material_id = $1 ORDER BY user_id;`,
    [material.id],
  );
  return { ...material, custodian_ids: result.rows.map((row) => row.user_id) };
}

export const materialRepository = {
  async findAll() {
    const result = await pool.query(`
      SELECT ${SELECT_FIELDS}
      FROM materiales m
      LEFT JOIN marcas ma ON ma.id = m.marca_id
      LEFT JOIN inventarios inv ON inv.id = m.inventario_id
      ORDER BY m.id;
    `);
    return Promise.all(result.rows.map(attachCustodians));
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS}
       FROM materiales m
       LEFT JOIN marcas ma ON ma.id = m.marca_id
       LEFT JOIN inventarios inv ON inv.id = m.inventario_id
       WHERE m.id = $1;`,
      [id],
    );
    return attachCustodians(result.rows[0] ?? null);
  },

  async create(data) {
    const {
      name, type, quantity, description, isActive, imageUrls,
      technicalSheetUrls, quotations, senaPlate, marcaId, custodianIds, inventarioId,
      location, purchaseDate, unitValue, totalValue,
      model, category, externalId,
    } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertResult = await client.query(
        `INSERT INTO materiales (
           name, type, quantity, description, is_active, image_urls,
           technical_sheet_urls, quotations, sena_plate, marca_id, inventario_id,
           location, purchase_date, unit_value, total_value,
           model, category, external_id
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING id;`,
        [
          name, type, quantity, description || null, isActive, imageUrls?.length ? imageUrls : null,
          technicalSheetUrls?.length ? technicalSheetUrls : null, quotations?.length ? JSON.stringify(quotations) : null,
          senaPlate || null, marcaId || null, inventarioId || null,
          location || null, purchaseDate || null, unitValue ?? null, totalValue ?? null,
          model || null, category || null, externalId || null,
        ],
      );
      const materialId = insertResult.rows[0].id;

      for (const userId of custodianIds ?? []) {
        await client.query(
          `INSERT INTO material_custodios (material_id, user_id) VALUES ($1,$2);`,
          [materialId, userId],
        );
      }

      await client.query("COMMIT");
      return { id: materialId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // Nota: is_active NO se toca aqui a proposito (se administra via
  // bulkDisable/setActive) para que editar un material no reactive uno que
  // se habia desactivado desde la tabla.
  async update(id, data) {
    const {
      name, type, quantity, description, imageUrls,
      technicalSheetUrls, quotations, senaPlate, marcaId, custodianIds, inventarioId,
      location, purchaseDate, unitValue, totalValue,
      model, category, externalId,
    } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateResult = await client.query(
        `UPDATE materiales SET
           name = $1, type = $2, quantity = $3, description = $4, image_urls = $5,
           technical_sheet_urls = $6, quotations = $7, sena_plate = $8, marca_id = $9, inventario_id = $10,
           location = $11, purchase_date = $12, unit_value = $13, total_value = $14,
           model = $15, category = $16, external_id = $17
         WHERE id = $18
         RETURNING id;`,
        [
          name, type, quantity, description || null, imageUrls?.length ? imageUrls : null,
          technicalSheetUrls?.length ? technicalSheetUrls : null, quotations?.length ? JSON.stringify(quotations) : null,
          senaPlate || null, marcaId || null, inventarioId || null,
          location || null, purchaseDate || null, unitValue ?? null, totalValue ?? null,
          model || null, category || null, externalId || null,
          id,
        ],
      );

      if (updateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(`DELETE FROM material_custodios WHERE material_id = $1;`, [id]);
      for (const userId of custodianIds ?? []) {
        await client.query(
          `INSERT INTO material_custodios (material_id, user_id) VALUES ($1,$2);`,
          [id, userId],
        );
      }

      await client.query("COMMIT");
      return { id };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
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
