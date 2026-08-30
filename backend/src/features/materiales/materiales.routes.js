import { Router } from "express";
import { materialController } from "./materiales.controller.js";

const router = Router();

router.get("/", materialController.getAll);
router.patch("/bulk-disable", materialController.bulkDisable);
router.patch("/:id/status", materialController.setActive);
router.get("/:id", materialController.getById);
router.post("/", materialController.create);
router.put("/:id", materialController.update);

export default router;
