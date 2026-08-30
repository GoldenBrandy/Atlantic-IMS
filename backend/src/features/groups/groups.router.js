import { Router } from "express";
import { groupsController } from "./groups.controller.js";

const router = Router();

router.get("/", groupsController.getAll);
router.post("/", groupsController.create);
router.patch("/bulk-disable", groupsController.bulkDisable);

router.get("/:groupId", groupsController.getById);
router.put("/:groupId", groupsController.update);
router.patch("/:groupId/status", groupsController.setActive);

router.get("/:groupId/permissions", groupsController.getPermissionsByGroupId);
router.put("/:groupId/permissions", groupsController.updatePermissions);

export default router;
