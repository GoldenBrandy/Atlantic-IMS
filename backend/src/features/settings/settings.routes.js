import { Router } from "express";
import { settingsController } from "./settings.controller.js";
import { authenticateToken, requireSuperUser } from "../../middlewares/auth.middleware.js";

const router = Router();

// Cualquier usuario logueado puede ver el correo de soporte (se muestra en "Ver perfil").
router.get("/support-email", authenticateToken, settingsController.getSupportEmail);

// Solo un super administrador puede cambiarlo.
router.put("/support-email", authenticateToken, requireSuperUser, settingsController.updateSupportEmail);

export default router;
