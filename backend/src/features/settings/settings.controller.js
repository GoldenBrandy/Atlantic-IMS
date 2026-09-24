import { settingsService } from "./settings.service.js";

export const settingsController = {
  async getSupportEmail(req, res) {
    try {
      const supportEmail = await settingsService.getSupportEmail();
      res.status(200).json({ supportEmail });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async updateSupportEmail(req, res) {
    try {
      const supportEmail = await settingsService.updateSupportEmail(req.body.supportEmail);
      res.status(200).json({ message: "Correo de soporte actualizado", supportEmail });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 400).json({ error: err.message });
    }
  },
};
