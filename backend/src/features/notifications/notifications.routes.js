import { Router } from "express";
import { notificationController } from "./notifications.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas requieren sesion: cada quien solo ve/marca sus propias notificaciones.
router.get("/", authenticateToken, notificationController.getAll);
router.patch("/read-all", authenticateToken, notificationController.markAllAsRead);
router.patch("/:id/read", authenticateToken, notificationController.markAsRead);

export default router;
