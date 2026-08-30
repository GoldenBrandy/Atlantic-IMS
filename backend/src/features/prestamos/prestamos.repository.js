import { pool } from "../../config/db.js";

const SELECT_FIELDS = `
  p.id, p.requesting_user, p.lending_user, p.ficha,
  p.justification, p.loan_type, p.start_date, p.due_date,
  p.signature_url, p.returned_at
`;

// Agrega los materiales asociados consultando la tabla puente.
async function attachMaterials(prestamo) {
  if (!prestamo) return prestamo;
  const result = await pool.query(
    `SELECT pm.material_id, m.name AS material_name, m.type AS material_item_type, m.quantity AS material_quantity
     FROM prestamos_materiales pm
     JOIN materiales m ON m.id = pm.material_id
     WHERE pm.prestamo_id = $1
     ORDER BY m.name;`,
    [prestamo.id],
  );
  return {
    ...prestamo,
    material_ids: result.rows.map((row) => row.material_id),
    materials: result.rows.map((row) => ({
      id: row.material_id,
      name: row.material_name,
      type: row.material_item_type,
      quantity: row.material_quantity,
    })),
  };
}

export const prestamoRepository = {
  async findAll() {
    const result = await pool.query(`
      SELECT ${SELECT_FIELDS}
      FROM prestamos p
      ORDER BY p.id;
    `);
    return Promise.all(result.rows.map(attachMaterials));
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS}
       FROM prestamos p
       WHERE p.id = $1;`,
      [id],
    );
    return attachMaterials(result.rows[0] ?? null);
  },

  async create(data) {
    const {
      materialIds, requestingUser, lendingUser, ficha,
      justification, loanType, startDate, dueDate, signatureUrl,
    } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertResult = await client.query(
        `INSERT INTO prestamos (
           requesting_user, lending_user, ficha,
           justification, loan_type, start_date, due_date, signature_url
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id;`,
        [requestingUser || null, lendingUser || null, ficha || null, justification || null, loanType, startDate || null, dueDate || null, signatureUrl || null],
      );
      const prestamoId = insertResult.rows[0].id;

      for (const materialId of materialIds ?? []) {
        await client.query(
          `INSERT INTO prestamos_materiales (prestamo_id, material_id) VALUES ($1,$2);`,
          [prestamoId, materialId],
        );
      }

      await client.query("COMMIT");
      return { id: prestamoId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id, data) {
    const {
      materialIds, requestingUser, lendingUser, ficha,
      justification, loanType, startDate, dueDate, signatureUrl,
    } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // La firma solo se sobreescribe si llega una nueva; de lo contrario se conserva la existente.
      const query = signatureUrl
        ? `UPDATE prestamos SET
             requesting_user = $1, lending_user = $2, ficha = $3,
             justification = $4, loan_type = $5, start_date = $6, due_date = $7, signature_url = $8
           WHERE id = $9
           RETURNING id;`
        : `UPDATE prestamos SET
             requesting_user = $1, lending_user = $2, ficha = $3,
             justification = $4, loan_type = $5, start_date = $6, due_date = $7
           WHERE id = $8
           RETURNING id;`;

      const values = signatureUrl
        ? [requestingUser || null, lendingUser || null, ficha || null, justification || null, loanType, startDate || null, dueDate || null, signatureUrl, id]
        : [requestingUser || null, lendingUser || null, ficha || null, justification || null, loanType, startDate || null, dueDate || null, id];

      const updateResult = await client.query(query, values);

      if (updateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(`DELETE FROM prestamos_materiales WHERE prestamo_id = $1;`, [id]);
      for (const materialId of materialIds ?? []) {
        await client.query(
          `INSERT INTO prestamos_materiales (prestamo_id, material_id) VALUES ($1,$2);`,
          [id, materialId],
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

  async markReturned(id) {
    const result = await pool.query(
      `UPDATE prestamos SET returned_at = NOW() WHERE id = $1 RETURNING id;`,
      [id],
    );
    return result.rows[0] ?? null;
  },
};
