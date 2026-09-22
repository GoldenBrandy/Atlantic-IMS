import { Router } from "express";
import { tareaController } from "./tareas.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", tareaController.getAll);
router.get("/:id", tareaController.getById);
// Requieren sesion: se necesita saber quien crea/ve/verifica la tarea
// (asignador vs. asignado).
router.post("/", authenticateToken, tareaController.create);
router.put("/:id", authenticateToken, tareaController.update);
router.patch("/:id/view", authenticateToken, tareaController.registerView);
router.patch("/:id/verify", authenticateToken, tareaController.verify);

export default router;
