import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { prestamoController } from "./prestamos.controller.js";

const router = Router();

// Todas las rutas de este modulo requieren sesion iniciada (JWT).
router.use(authenticateToken);

router.get("/", prestamoController.getAll);
router.get("/:id", prestamoController.getById);
router.post("/", prestamoController.create);
router.put("/:id", prestamoController.update);
router.patch("/:id/return", prestamoController.returnLoan);

export default router;
