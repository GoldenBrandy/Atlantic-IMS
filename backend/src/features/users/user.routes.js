// Importamos Router desde Express.
// Router permite modularizar las rutas por feature
// y mantener el archivo principal de la app limpio.
import { Router } from "express";


// Importamos el controlador de usuarios.
// El router nunca implementa lógica,
// solo delega la ejecución al controller.
import { userController } from "./user.controller.js";
import { authenticateToken, requireSuperUser, requireOwnUser } from "../../middlewares/auth.middleware.js";


// Creamos una instancia del router de Express
const router = Router();


// Definimos la ruta para crear un usuario
// POST /users
// Cuando se recibe una petición POST en la raíz del recurso,
// Express ejecuta el método create del controller.
router.post("/", userController.create);


// Definimos la ruta para listar todos los usuarios
// GET /users
// Se usa para poblar selects (responsable, lider, integrantes, etc.) en otros modulos.
router.get("/", userController.getAll);


// Deshabilita varios usuarios a la vez. Solo super administrador.
router.patch("/bulk-disable", authenticateToken, requireSuperUser, userController.bulkDisable);


// Activa/desactiva un unico usuario (switch individual). Solo super administrador.
router.patch("/:id/status", authenticateToken, requireSuperUser, userController.setActive);


// Definimos la ruta para obtener un usuario por id
// GET /users/:id
// Se usa para precargar el formulario de edicion con los datos actuales.
router.get("/:id", userController.getById);


// Definimos la ruta para actualizar un usuario existente
// PUT /users/:id
// Solo un super administrador puede editar nombres/informacion personal de
// cualquier usuario (incluida la suya propia).
router.put("/:id", authenticateToken, requireSuperUser, userController.update);


// Cambia unicamente la contrasena del propio usuario autenticado
// (usado desde "Ver perfil" por usuarios que no son super administrador).
router.put("/:id/password", authenticateToken, requireOwnUser, userController.changePassword);


// Definimos las rutas para gestionar los permisos individuales de un usuario
// (independientes de los permisos que otorga su grupo/tipo de usuario).
router.get("/:id/permissions", userController.getPermissionsByUserId);
router.put("/:id/permissions", userController.updateUserPermissions);


// Exportamos el router para ser registrado en la aplicación principal
// (ej: app.use("/users", router))
export default router;
