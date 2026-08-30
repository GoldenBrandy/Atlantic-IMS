import { devolucionService } from "./devoluciones.service.js";

export const devolucionController = {
  async getAll(req, res) {
    try {
      const devoluciones = await devolucionService.getAllDevoluciones();
      res.status(200).json(devoluciones);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getByPrestamoId(req, res) {
    try {
      const devolucion = await devolucionService.getDevolucionByPrestamoId(req.params.prestamoId);
      res.status(200).json(devolucion);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const devolucion = await devolucionService.createDevolucion(req.params.prestamoId, req.body);
      res.status(201).json({
        message: "Devolución registrada correctamente",
        prestamoId: devolucion.prestamoId,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message, field: err.field });
    }
  },
};
