import { pool } from '../../config/db.js';

export const authRepository = {
    async findUserByEmail(userEmail) {
        const query = `
            SELECT id, user_name, user_email, password, is_active, is_superuser
            FROM users
            WHERE user_email = $1
            LIMIT 1;
        `;
        const result = await pool.query(query, [userEmail]);
        return result.rows[0];
    }
}