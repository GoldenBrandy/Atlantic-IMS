import{ Router } from  "express";
import { auditLogController } from "./auditLogs.controller.js";
import { authenticateToken, requireSuperUser } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticateToken, requireSuperUser, auditLogController.getAll);

export default router;