import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { prestamoController } from "./prestamos.controller.js";

const router = Router();

// Publicas a proposito: la persona confirma su identidad desde el link del
// correo, sin necesitar sesion iniciada (puede no tener cuenta siquiera).
router.post("/:id/confirm-identity", prestamoController.confirmIdentity);
router.post("/:id/resend-identity-code", prestamoController.resendIdentityCode);

// El resto de rutas de este modulo requieren sesion iniciada (JWT).
router.use(authenticateToken);

router.get("/", prestamoController.getAll);
router.get("/:id", prestamoController.getById);
router.post("/", prestamoController.create);
router.put("/:id", prestamoController.update);
router.patch("/:id/return", prestamoController.returnLoan);

export default router;
