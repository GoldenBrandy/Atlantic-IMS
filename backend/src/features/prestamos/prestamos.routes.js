import { Router } from "express";
import { prestamoController } from "./prestamos.controller.js";

const router = Router();

router.get("/", prestamoController.getAll);
router.get("/:id", prestamoController.getById);
router.post("/", prestamoController.create);
router.put("/:id", prestamoController.update);
router.patch("/:id/return", prestamoController.returnLoan);

export default router;
