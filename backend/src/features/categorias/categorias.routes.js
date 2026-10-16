import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { categoriaController } from "./categorias.controller.js";

const router = Router();

// Todas las rutas de este modulo requieren sesion iniciada (JWT).
router.use(authenticateToken);

router.get("/", categoriaController.getAll);
router.patch("/bulk-disable", categoriaController.bulkDisable);
router.patch("/:id/status", categoriaController.setActive);
router.get("/:id", categoriaController.getById);
router.post("/", categoriaController.create);
router.put("/:id", categoriaController.update);

export default router;
