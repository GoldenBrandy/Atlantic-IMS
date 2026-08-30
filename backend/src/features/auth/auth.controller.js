import { authService } from './auth.service.js';

export const authController = {
    async login(req, res) {
        try {
            const result = await authService.login(req.body);

            res.status(200).json({
                message: 'Login exitoso',
                ...result,
            });
        } catch (error) {
            res.status(401).json({
                error: error.message,
            });
        }
    },
};