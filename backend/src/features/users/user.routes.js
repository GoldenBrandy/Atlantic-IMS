// Importamos Router desde Express.
// Router permite modularizar las rutas por feature
// y mantener el archivo principal de la app limpio.
import { Router } from "express";


// Importamos el controlador de usuarios.
// El router nunca implementa lógica,
// solo delega la ejecución al controller.
import { userController } from "./user.controller.js";
import { authenticateToken, requireSuperUser, requireOwnUser } from "../../middlewares/auth.middleware.js";
import { requiresPermission } from "../../middlewares/permissions.middleware.js";


// Creamos una instancia del router de Express
const router = Router();


// Definimos la ruta para crear un usuario
// POST /users
// Requiere sesion iniciada y el permiso "create_users" (por grupo o
// individual; un super administrador siempre pasa, ver access.service.js).
router.post("/", authenticateToken, requiresPermission("create_users"), userController.create);


// Definimos la ruta para listar todos los usuarios
// GET /users
// Solo requiere sesion iniciada (sin permiso granular): se usa para poblar
// selects (responsable, lider, integrantes, etc.) en pantallas que no son
// exclusivas de administracion de usuarios.
router.get("/", authenticateToken, userController.getAll);


// Deshabilita varios usuarios a la vez. Requiere el permiso "disable_users".
router.patch("/bulk-disable", authenticateToken, requiresPermission("disable_users"), userController.bulkDisable);


// Activa/desactiva un unico usuario (switch individual). Requiere "disable_users".
router.patch("/:id/status", authenticateToken, requiresPermission("disable_users"), userController.setActive);


// Definimos la ruta para obtener un usuario por id
// GET /users/:id
// Solo requiere sesion iniciada: la usa tanto "Ver perfil" (propio usuario)
// como el formulario de edicion (administracion).
router.get("/:id", authenticateToken, userController.getById);


// Definimos la ruta para actualizar un usuario existente
// PUT /users/:id
// Requiere el permiso "edit_users".
router.put("/:id", authenticateToken, requiresPermission("edit_users"), userController.update);


// Cambia unicamente la contrasena del propio usuario autenticado
// (usado desde "Ver perfil" por usuarios que no son super administrador).
router.put("/:id/password", authenticateToken, requireOwnUser, userController.changePassword);


// Definimos las rutas para gestionar los permisos individuales de un usuario
// (independientes de los permisos que otorga su grupo/tipo de usuario).
// Solo un super administrador puede ver/otorgar permisos: delegar esto via un
// permiso granular normal abriria la puerta a que alguien se autoasigne mas
// permisos de los que su rol deberia tener.
router.get("/:id/permissions", authenticateToken, requireSuperUser, userController.getPermissionsByUserId);
router.put("/:id/permissions", authenticateToken, requireSuperUser, userController.updateUserPermissions);


// Exportamos el router para ser registrado en la aplicación principal
// (ej: app.use("/users", router))
export default router;
