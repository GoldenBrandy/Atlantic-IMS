import { pool } from "../../config/db.js";

const SELECT_FIELDS = `
  p.id, p.requesting_user, p.lending_user, p.ficha, p.requester_email,
  p.justification, p.loan_type, p.start_date, p.due_date,
  p.signature_url, p.returned_at, p.requester_identity_confirmed, p.lender_identity_confirmed, ru.document_number AS requesting_user_document, lu.document_number AS lending_user_document
`;

const JOINS = `
  LEFT JOIN users ru ON ru.id = p.requesting_user
  LEFT JOIN users lu ON lu.id = p.lending_user
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
      ${JOINS}
      ORDER BY p.id;
    `);
    return Promise.all(result.rows.map(attachMaterials));
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS}
       FROM prestamos p
       ${JOINS}
       WHERE p.id = $1;`,
      [id],
    );
    return attachMaterials(result.rows[0] ?? null);
  },

  // Estado actual de los materiales indicados (para validar antes de prestar).
  async findMaterialsByIds(ids) {
    const result = await pool.query(
      `SELECT id, name, type, quantity, is_active FROM materiales WHERE id = ANY($1::int[]);`,
      [ids],
    );
    return result.rows;
  },

  async create(data) {
    const {
      materialIds,
      requestingUser,
      lendingUser,
      ficha,
      requesterEmail,
      justification,
      loanType,
      startDate,
      dueDate,
      signatureUrl,
    } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // requester_identity_confirmed / lender_identity_confirmed NO se
      // reciben del cliente: quedan en su default (false) y solo cambian
      // via confirmRequesterIdentity/confirmLenderIdentity, despues de
      // validar el codigo enviado por correo. Si el cliente pudiera
      // mandarlas, se saltaria toda la verificacion.
      const insertResult = await client.query(
        `INSERT INTO prestamos (
           requesting_user, lending_user, ficha, requester_email,
           justification, loan_type, start_date, due_date, signature_url
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id;`,
        [
          requestingUser || null,
          lendingUser || null,
          ficha || null,
          requesterEmail || null,
          justification || null,
          loanType,
          startDate || null,
          dueDate || null,
          signatureUrl || null,
        ],
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
      materialIds,
      requestingUser,
      lendingUser,
      ficha,
      requesterEmail,
      justification,
      loanType,
      startDate,
      dueDate,
      signatureUrl,
    } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // La firma solo se sobreescribe si llega una nueva; de lo contrario se
      // conserva la existente. requester_identity_confirmed /
      // lender_identity_confirmed NO se tocan aqui a proposito: editar un
      // prestamo (ej. cambiar fechas) no debe resetear una confirmacion de
      // identidad ya validada por correo.
      const query = signatureUrl
        ? `UPDATE prestamos SET
             requesting_user = $1, lending_user = $2, ficha = $3, requester_email = $4,
             justification = $5, loan_type = $6, start_date = $7, due_date = $8, signature_url = $9
           WHERE id = $10
           RETURNING id;`
        : `UPDATE prestamos SET
             requesting_user = $1, lending_user = $2, ficha = $3, requester_email = $4,
             justification = $5, loan_type = $6, start_date = $7, due_date = $8
           WHERE id = $9
           RETURNING id;`;

      const values = signatureUrl
        ? [
            requestingUser || null,
            lendingUser || null,
            ficha || null,
            requesterEmail || null,
            justification || null,
            loanType,
            startDate || null,
            dueDate || null,
            signatureUrl,
            id,
          ]
        : [
            requestingUser || null,
            lendingUser || null,
            ficha || null,
            requesterEmail || null,
            justification || null,
            loanType,
            startDate || null,
            dueDate || null,
            id,
          ];

      const updateResult = await client.query(query, values);

      if (updateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `DELETE FROM prestamos_materiales WHERE prestamo_id = $1;`,
        [id],
      );
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

  // Correo/nombre de un usuario registrado, para mandarle el codigo de
  // confirmacion de identidad (solicitante o prestador con cuenta).
  async getUserContact(userId) {
    if (!userId) return null;
    const result = await pool.query(
      `SELECT user_email, user_name FROM users WHERE id = $1;`,
      [userId],
    );
    return result.rows[0] ?? null;
  },

  async setRequesterOtp(prestamoId, code, expiresAt) {
    await pool.query(
      `UPDATE prestamos SET requester_otp_code = $1, requester_otp_expires_at = $2 WHERE id = $3;`,
      [code, expiresAt, prestamoId],
    );
  },

  async setLenderOtp(prestamoId, code, expiresAt) {
    await pool.query(
      `UPDATE prestamos SET lender_otp_code = $1, lender_otp_expires_at = $2 WHERE id = $3;`,
      [code, expiresAt, prestamoId],
    );
  },

  async getIdentityState(prestamoId) {
    const result = await pool.query(
      `SELECT requester_otp_code, requester_otp_expires_at, requester_identity_confirmed,
              lender_otp_code, lender_otp_expires_at, lender_identity_confirmed
       FROM prestamos WHERE id = $1;`,
      [prestamoId],
    );
    return result.rows[0] ?? null;
  },

  async confirmRequesterIdentity(prestamoId) {
    const result = await pool.query(
      `UPDATE prestamos
       SET requester_identity_confirmed = true, requester_otp_code = NULL, requester_otp_expires_at = NULL
       WHERE id = $1 RETURNING id;`,
      [prestamoId],
    );
    return result.rows[0] ?? null;
  },

  async confirmLenderIdentity(prestamoId) {
    const result = await pool.query(
      `UPDATE prestamos
       SET lender_identity_confirmed = true, lender_otp_code = NULL, lender_otp_expires_at = NULL
       WHERE id = $1 RETURNING id;`,
      [prestamoId],
    );
    return result.rows[0] ?? null;
  },
};
