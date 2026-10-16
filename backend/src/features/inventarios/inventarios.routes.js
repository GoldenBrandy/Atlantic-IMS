// Router del feature inventarios: cada ruta queda bajo el prefijo /api/inventarios.
import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { inventariosController } from "./inventarios.controller.js";

const router = Router();

// Todas las rutas de este modulo requieren sesion iniciada (JWT).
router.use(authenticateToken);

router.get("/", inventariosController.getAll);
router.get("/:id", inventariosController.getById);
router.post("/", inventariosController.create);
router.put("/:id", inventariosController.update);
router.patch("/bulk-disable", inventariosController.bulkDisable);
router.patch("/:id/status", inventariosController.setActive);

export default router;