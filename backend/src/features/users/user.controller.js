// Importamos el servicio de usuarios.
// El controller NO implementa lógica de negocio,
// solo delega la operación al service correspondiente.
import { userService } from "./user.service.js";


// Exportamos un objeto controlador.
// Agrupar handlers en un objeto permite escalabilidad
// (create, update, delete, getById, etc.)
export const userController = {


  // Método encargado de manejar la creación de un usuario
  // Se asume que este método será usado como handler de una ruta Express
  async create(req, res) {


    // Log del cuerpo de la petición
    // Útil en desarrollo para validar que el frontend envía correctamente los datos
    // En producción suele reemplazarse por logging estructurado o eliminarse
    console.log("BODY RECIBIDO:", req.body); // CLAVE


    try {
      // Llamamos al servicio de usuario, pasando los datos recibidos
      // Aquí ocurre la lógica real de negocio (validaciones, persistencia, etc.)
      const user = await userService.createUser(req.body);


      // Respuesta HTTP en caso de éxito
      // 201: recurso creado correctamente según el estándar REST
      res.status(201).json({
        // Mensaje informativo para el cliente
        message: "Usuario creado correctamente",


        // Retornamos únicamente el ID del usuario creado
        // Evita exponer información sensible innecesaria
        userId: user.id,
      });


    } catch (err) {
      // Capturamos cualquier error lanzado por el service o capas inferiores
      // Se registra el error completo para depuración en backend
      console.error("ERROR BACKEND:", err);


      // Respuesta HTTP de error. Si el service marco un statusCode/field
      // (ej: correo o telefono duplicado), se respeta para que el frontend
      // pueda marcar el campo correcto.
      res.status(err.statusCode ?? 500).json({
        // Se envía el mensaje del error para diagnóstico
        // En producción suele mapearse a mensajes controlados
        error: err.message,
        field: err.field,
      });
    }
  },


  // Método encargado de listar todos los usuarios (para selects de otros modulos).
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({
        error: err.message,
      });
    }
  },


  // Método encargado de devolver los datos de un usuario para precargar el formulario de edicion.
  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({
        error: err.message,
      });
    }
  },


  // Método encargado de actualizar un usuario existente.
  async update(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        message: "Usuario actualizado correctamente",
        userId: user.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 400).json({
        error: err.message,
        field: err.field,
      });
    }
  },


  // Activa/desactiva un unico usuario (switch individual). Solo super administrador.
  async setActive(req, res) {
    try {
      const updated = await userService.setActive(req.params.id, Boolean(req.body?.isActive));
      res.status(200).json({
        message: "Estado del usuario actualizado correctamente",
        isActive: updated.is_active,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 400).json({ error: err.message });
    }
  },


  // Deshabilita varios usuarios a la vez. Solo super administrador (ver rutas).
  async bulkDisable(req, res) {
    try {
      const updated = await userService.bulkDisable(req.body?.ids);
      res.status(200).json({
        message: "Usuarios deshabilitados correctamente",
        updated: updated.map((row) => row.id),
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },


  // Cambia la contrasena del usuario autenticado (solo la puede cambiar el
  // propio dueño de la cuenta; ver requireOwnUser en las rutas).
  async changePassword(req, res) {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: "El ID del usuario no es válido" });
      }

      await userService.changePassword(userId, req.body);
      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({
        error: err.message,
        field: err.field,
      });
    }
  },


  // Permisos individuales del usuario (independientes de su grupo).
  async getPermissionsByUserId(req, res) {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: "El ID del usuario no es válido" });
      }

      const permissions = await userService.getPermissionsByUserId(userId);
      res.status(200).json(permissions);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },


  async updateUserPermissions(req, res) {
    try {
      const userId = Number(req.params.id);
      const { permissions } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: "El ID del usuario no es válido" });
      }

      if (
        !Array.isArray(permissions) ||
        permissions.some((permission) => typeof permission !== "string")
      ) {
        return res.status(400).json({ error: "Los permisos deben ser una lista de códigos" });
      }

      const updatedPermissions = await userService.updateUserPermissions(userId, permissions);

      res.status(200).json({
        message: "Permisos actualizados correctamente",
        permissions: updatedPermissions,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({
        error: err.message || "Error al actualizar los permisos del usuario",
      });
    }
  },
};
