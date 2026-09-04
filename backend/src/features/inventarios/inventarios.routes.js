// Router del feature inventarios: cada ruta queda bajo el prefijo /api/inventarios.
import { Router } from "express";
import { inventariosController } from "./inventarios.controller.js";

const router = Router();

router.get("/", inventariosController.getAll);
router.get("/:id", inventariosController.getById);
router.post("/", inventariosController.create);
router.put("/:id", inventariosController.update);
router.patch("/bulk-disable", inventariosController.bulkDisable);
router.patch("/:id/status", inventariosController.setActive);

export default router;