import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { devolucionController } from "./devoluciones.controller.js";

const router = Router();

// Todas las rutas de este modulo requieren sesion iniciada (JWT).
router.use(authenticateToken);

router.get("/", devolucionController.getAll);
router.get("/:prestamoId", devolucionController.getByPrestamoId);
router.post("/:prestamoId", devolucionController.create);

export default router;
