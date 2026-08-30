import { auditLogService } from "./auditLogs.service.js";

export const auditLogController = {
    async getAll(req, res) {
        try {
            const logs = await auditLogService.getAll();
            res.status(200).json(logs);
        } catch (err) {
            console.error("ERROR BACKEND:", err);
            res.status(500).json({ error: err.message });
        }
    },
};