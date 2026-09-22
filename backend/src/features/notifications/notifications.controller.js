import { notificationService } from "./notifications.service.js";

export const notificationController = {
  async getAll(req, res) {
    try {
      const notifications = await notificationService.getForUser(req.user.id);
      res.status(200).json(notifications);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async markAsRead(req, res) {
    try {
      await notificationService.markAsRead(Number(req.params.id), req.user.id);
      res.status(200).json({ message: "Notificación marcada como leída" });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
