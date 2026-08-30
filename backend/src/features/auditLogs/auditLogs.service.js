import { auditLogRepository } from './auditLogs.repository.js';

export const auditLogService = {
    async record({ actorId, actorEmail, isSuperUser, module, action, entityId, description }) {
        if (isSuperUser) return;
        await auditLogRepository.create({ actorId, actorEmail, module, action, entityId, description });
    },

    async getAll() {
        return auditLogRepository.findAll();
    },
};