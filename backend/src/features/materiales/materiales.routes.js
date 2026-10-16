import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { materialController } from "./materiales.controller.js";

const router = Router();

// Todas las rutas de este modulo requieren sesion iniciada (JWT).
router.use(authenticateToken);

router.get("/", materialController.getAll);
router.patch("/bulk-disable", materialController.bulkDisable);
router.patch("/:id/status", materialController.setActive);
router.get("/:id", materialController.getById);
router.post("/", materialController.create);
router.put("/:id", materialController.update);

export default router;
