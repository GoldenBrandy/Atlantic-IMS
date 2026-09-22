import { notificationRepository } from "./notifications.repository.js";

export const notificationService = {
  async getForUser(userId) {
    return notificationRepository.findByUserId(userId);
  },

  async markAsRead(id, userId) {
    const updated = await notificationRepository.markAsRead(id, userId);
    if (!updated) throw new Error("Notificación no encontrada");
    return updated;
  },

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return { message: "Notificaciones marcadas como leídas" };
  },
};
