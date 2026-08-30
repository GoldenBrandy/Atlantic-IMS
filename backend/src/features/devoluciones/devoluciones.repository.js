import { pool } from "../../config/db.js";

const SELECT_FIELDS = `d.prestamo_id, d.returned_by, d.observation, d.created_at`;

// Agrega el detalle por material (cantidad devuelta y estado) consultando la tabla puente.
async function attachDetails(devolucion) {
  if (!devolucion) return devolucion;
  const result = await pool.query(
    `SELECT dm.material_id, m.name AS material_name, m.quantity AS material_quantity,
            dm.quantity_returned, dm.condition
     FROM devoluciones_materiales dm
     JOIN materiales m ON m.id = dm.material_id
     WHERE dm.prestamo_id = $1
     ORDER BY m.name;`,
    [devolucion.prestamo_id],
  );
  return {
    ...devolucion,
    materials: result.rows.map((row) => ({
      materialId: row.material_id,
      materialName: row.material_name,
      materialQuantity: row.material_quantity,
      quantityReturned: row.quantity_returned,
      condition: row.condition,
    })),
  };
}

export const devolucionRepository = {
  async findAll() {
    const result = await pool.query(`
      SELECT ${SELECT_FIELDS}
      FROM devoluciones d
      ORDER BY d.prestamo_id DESC;
    `);
    return Promise.all(result.rows.map(attachDetails));
  },

  async findByPrestamoId(prestamoId) {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM devoluciones d WHERE d.prestamo_id = $1;`,
      [prestamoId],
    );
    return attachDetails(result.rows[0] ?? null);
  },

  async create(prestamoId, data) {
    const { returnedBy, observation, materials } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO devoluciones (prestamo_id, returned_by, observation) VALUES ($1,$2,$3);`,
        [prestamoId, returnedBy || null, observation || null],
      );

      for (const material of materials ?? []) {
        await client.query(
          `INSERT INTO devoluciones_materiales (prestamo_id, material_id, quantity_returned, condition)
           VALUES ($1,$2,$3,$4);`,
          [prestamoId, material.materialId, material.quantityReturned, material.condition],
        );
      }

      await client.query(`UPDATE prestamos SET returned_at = NOW() WHERE id = $1;`, [prestamoId]);

      await client.query("COMMIT");
      return { prestamoId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
