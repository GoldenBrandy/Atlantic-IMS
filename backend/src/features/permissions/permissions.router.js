// backend/src/features/permissions/permissions.router.js

import { Router } from "express";
import { permissionsController } from "./permissions.controller.js";
import { authenticateToken, requireSuperUser } from "../../middlewares/auth.middleware.js";

const router = Router();

// Solo un super administrador administra el catalogo de permisos (misma
// razon que las rutas de permisos de usuarios/grupos).
router.get("/", authenticateToken, requireSuperUser, permissionsController.getAll);

export default router;

// El router de permisos define una ruta GET en la raíz ("/") que llama al método getAll del controlador de permisos. Esto permite que los clientes realicen solicitudes HTTP GET a la ruta "/permissions" para obtener todos los permisos disponibles.

