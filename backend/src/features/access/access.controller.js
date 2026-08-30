import { accessService } from './access.service.js';

export const accessController = {
    async testPermission(req, res) {
        const userId = Number(req.params.userId);

        const hasPermission = await accessService.hasPermission(userId, 'list_users');

        res.json({
            userId,
            permission: 'list_users',
            granted: hasPermission
        });
    }
};