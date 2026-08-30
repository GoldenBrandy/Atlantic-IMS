import { groupsService } from "./groups.service.js";

export const groupsController = {
  async getAll(req, res) {
    try {
      const groups = await groupsService.getAll();

      res.json(groups);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Error al obtener los grupos",
      });
    }
  },

  async getById(req, res) {
    try {
      const group = await groupsService.getById(req.params.groupId);
      res.status(200).json(group);
    } catch (error) {
      console.error(error);
      res.status(404).json({ error: error.message || "Grupo no encontrado" });
    }
  },

  async create(req, res) {
    try {
      const group = await groupsService.create(req.body);
      res.status(201).json({
        message: "Grupo creado correctamente",
        groupId: group.group_id,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode ?? 500).json({
        error: error.message || "Error al crear el grupo",
      });
    }
  },

  async update(req, res) {
    try {
      const group = await groupsService.update(req.params.groupId, req.body);
      res.status(200).json({
        message: "Grupo actualizado correctamente",
        groupId: group.group_id,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode ?? 400).json({
        error: error.message || "Error al actualizar el grupo",
      });
    }
  },

  async bulkDisable(req, res) {
    try {
      const updated = await groupsService.bulkDisable(req.body?.ids);
      res.status(200).json({
        message: "Grupos deshabilitados correctamente",
        updated: updated.map((row) => row.group_id),
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode ?? 500).json({
        error: error.message || "Error al deshabilitar los grupos",
      });
    }
  },

  async setActive(req, res) {
    try {
      const updated = await groupsService.setActive(req.params.groupId, Boolean(req.body?.isActive));
      res.status(200).json({
        message: "Estado del grupo actualizado correctamente",
        isActive: updated.is_active,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || "Error al actualizar el estado del grupo" });
    }
  },

  // Permisos de Grupo
  async getPermissionsByGroupId(req, res) {
    try {
      const groupId = Number(req.params.groupId);

      if (Number.isNaN(groupId)) {
        return res.status(400).json({
          error: "El ID del grupo no es válido",
        });
      }

      const permissions = await groupsService.getPermissionsByGroupId(groupId);
      res.json(permissions);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al obtener los permisos del grupo",
      });
    }
  },

  async updatePermissions(req, res) {
    try {
      const groupId = Number(req.params.groupId);
      const { permissions } = req.body;

      if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({
          error: "El ID del grupo no es válido",
        });
      }

      if (
        !Array.isArray(permissions) ||
        permissions.some((permission) => typeof permission !== "string")
      ) {
        return res.status(400).json({
          error: "Los permisos deben ser una lista de códigos",
        });
      }

      const updatedPermissions = await groupsService.updatePermissions(
        groupId,
        permissions,
      );

      res.status(200).json({
        message: "Permisos actualizados correctamente",
        permissions: updatedPermissions,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode ?? 500).json({
        error: error.message || "Error al actualizar los permisos del grupo",
      });
    }
  },
};
