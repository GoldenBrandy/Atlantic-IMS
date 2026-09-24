import { Router } from "express";
import { groupsController } from "./groups.controller.js";
import { authenticateToken, requireSuperUser } from "../../middlewares/auth.middleware.js";
import { requiresPermission } from "../../middlewares/permissions.middleware.js";

const router = Router();

// Solo requiere sesion iniciada (sin permiso granular): se usa para poblar
// selects (tipo de usuario, grupo en "Ver perfil", etc.) fuera de la
// administracion de grupos.
router.get("/", authenticateToken, groupsController.getAll);
router.post("/", authenticateToken, requiresPermission("create_grupos_aprendices"), groupsController.create);
router.patch("/bulk-disable", authenticateToken, requiresPermission("delete_grupos_aprendices"), groupsController.bulkDisable);

router.get("/:groupId", authenticateToken, groupsController.getById);
router.put("/:groupId", authenticateToken, requiresPermission("edit_grupos_aprendices"), groupsController.update);
router.patch("/:groupId/status", authenticateToken, requiresPermission("delete_grupos_aprendices"), groupsController.setActive);

// Solo un super administrador puede ver/otorgar permisos de un grupo: igual
// que en usuarios, esto no se delega via permiso granular para evitar que
// alguien se autoasigne mas permisos de los que deberia tener.
router.get("/:groupId/permissions", authenticateToken, requireSuperUser, groupsController.getPermissionsByGroupId);
router.put("/:groupId/permissions", authenticateToken, requireSuperUser, groupsController.updatePermissions);

export default router;
