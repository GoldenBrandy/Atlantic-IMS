import { pool } from "../../config/db.js";

export const auditLogRepository = {
    async create({ actorId, actorEmail, module, action, entityId, description }) {
        const result = await pool.query(
            `INSERT INTO audit_logs (actor_id, actor_email, module, action, entity_id, description)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING id;`,
            [actorId, actorEmail, module, action, entityId, description],
        );
        
        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query(
            `SELECT id, actor_id, actor_email, module, action, entity_id, description, created_at
                FROM audit_logs
                ORDER BY created_at DESC;`,
        );
        return result.rows;
    },
};