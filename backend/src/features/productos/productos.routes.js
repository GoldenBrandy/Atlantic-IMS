import { Router } from "express";
import { productoController } from "./productos.controller.js";

const router = Router();

router.get("/", productoController.getAll);
router.patch("/bulk-disable", productoController.bulkDisable);
router.patch("/:id/status", productoController.setActive);
router.get("/:id", productoController.getById);
router.post("/", productoController.create);
router.put("/:id", productoController.update);

export default router;
