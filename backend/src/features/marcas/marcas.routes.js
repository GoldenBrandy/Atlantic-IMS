import { Router } from "express";
import { marcaController } from "./marcas.controller.js";

const router = Router();

router.get("/", marcaController.getAll);
router.patch("/bulk-disable", marcaController.bulkDisable);
router.patch("/:id/status", marcaController.setActive);
router.get("/:id", marcaController.getById);
router.post("/", marcaController.create);
router.put("/:id", marcaController.update);

export default router;
