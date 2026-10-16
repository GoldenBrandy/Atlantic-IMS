import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { cotizacionController } from "./cotizaciones.controller.js";

const router = Router();

// Todas las rutas de este modulo requieren sesion iniciada (JWT).
router.use(authenticateToken);

router.get("/", cotizacionController.getAll);
router.patch("/bulk-disable", cotizacionController.bulkDisable);
router.patch("/:id/status", cotizacionController.setActive);
router.get("/:id", cotizacionController.getById);
router.post("/", cotizacionController.create);
router.put("/:id", cotizacionController.update);

export default router;
