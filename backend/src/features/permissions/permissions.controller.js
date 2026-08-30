// backend/src/features/permissions/permissions.controller.js

import { permissionsService } from "./permissions.service.js";

export const permissionsController = {
  async getAll(req, res) {
    try {
      const permissions = await permissionsService.getAll();
      res.json(permissions);
    } catch (error) {
      console.error("Error al obtener los permisos:", error);
      res.status(500).json({
        error: "Error al obtener los permisos",
      });
    }
  },
};
