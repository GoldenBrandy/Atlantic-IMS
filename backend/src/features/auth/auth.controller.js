import { authService } from "./auth.service.js";

export const authController = {
  async login(req, res) {
    // Datos faltantes: solicitud invalida (400), no credenciales invalidas (401).
    if (!req.body?.userEmail || !req.body?.userPassword) {
      return res.status(400).json({
        error: "Correo y contrasena son obligatorios",
      });
    }

    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        message: "Login exitoso",
        ...result,
      });
    } catch (error) {
      res.status(401).json({
        error: error.message,
      });
    }
  },

  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body?.userEmail);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async verifyResetCode(req, res) {
    try {
      const result = await authService.verifyResetCode(req.body);
      res.status(200).json(result);
    } catch (error) {
      res
        .status(error.statusCode ?? 400)
        .json({ error: error.message, field: error.field });
    }
  },

  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (error) {
      res
        .status(error.statusCode ?? 400)
        .json({ error: error.message, field: error.field });
    }
  },

  async requestAccess(req, res) {
    try {
      const result = await authService.requestAccess(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
