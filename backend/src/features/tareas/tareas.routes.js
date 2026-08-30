import { Router } from "express";
import { tareaController } from "./tareas.controller.js";

const router = Router();

router.get("/", tareaController.getAll);
router.get("/:id", tareaController.getById);
router.post("/", tareaController.create);
router.put("/:id", tareaController.update);

export default router;
