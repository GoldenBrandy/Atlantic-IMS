import { Router } from "express";
import { devolucionController } from "./devoluciones.controller.js";

const router = Router();

router.get("/", devolucionController.getAll);
router.get("/:prestamoId", devolucionController.getByPrestamoId);
router.post("/:prestamoId", devolucionController.create);

export default router;
