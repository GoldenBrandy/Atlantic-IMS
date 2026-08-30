import { accessService } from "../features/access/access.service.js";

export const requiresPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Usuario no autenticado.",
        });
      }

      const granted = await accessService.hasPermission(userId, permissionCode);

      if (!granted) {
        return res.status(403).json({
          message: "No tiene permiso para realizar esta accion.",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
