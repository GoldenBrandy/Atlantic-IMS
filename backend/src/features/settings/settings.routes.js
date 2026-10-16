import { Router } from "express";
import { settingsController } from "./settings.controller.js";
import { authenticateToken, requireSuperUser } from "../../middlewares/auth.middleware.js";

const router = Router();

// Publico a proposito: se muestra en "Ver perfil" (ya logueado) y tambien en
// el login/pantallas de acceso, para personas que todavia no tienen cuenta.
router.get("/support-email", settingsController.getSupportEmail);

// Solo un super administrador puede cambiarlo.
router.put("/support-email", authenticateToken, requireSuperUser, settingsController.updateSupportEmail);

export default router;
