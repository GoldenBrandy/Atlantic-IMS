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
    },

    // Usado por el frontend para saber, antes de mostrar una pantalla, si el
    // usuario autenticado tiene el permiso indicado (super admin siempre lo tiene).
    async checkPermission(req, res) {
        const userId = req.user.id;
        const { code } = req.params;

        const granted = await accessService.hasPermission(userId, code);

        res.json({ granted });
    }
};