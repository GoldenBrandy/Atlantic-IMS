import { cotizacionService } from "./cotizaciones.service.js";

export const cotizacionController = {
  async getAll(req, res) {
    try {
      const cotizaciones = await cotizacionService.getAllCotizaciones();
      res.status(200).json(cotizaciones);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const cotizacion = await cotizacionService.getCotizacionById(req.params.id);
      res.status(200).json(cotizacion);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const cotizacion = await cotizacionService.createCotizacion(req.body);
      res.status(201).json({
        message: "Cotización creada correctamente",
        cotizacionId: cotizacion.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message, field: err.field });
    }
  },

  async update(req, res) {
    try {
      const cotizacion = await cotizacionService.updateCotizacion(req.params.id, req.body);
      res.status(200).json({
        message: "Cotización actualizada correctamente",
        cotizacionId: cotizacion.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 400).json({ error: err.message, field: err.field });
    }
  },

  async bulkDisable(req, res) {
    try {
      const updated = await cotizacionService.bulkDisable(req.body?.ids);
      res.status(200).json({
        message: "Cotizaciones deshabilitadas correctamente",
        updated: updated.map((row) => row.id),
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async setActive(req, res) {
    try {
      const updated = await cotizacionService.setActive(req.params.id, Boolean(req.body?.isActive));
      res.status(200).json({
        message: "Estado de la cotización actualizado correctamente",
        status: updated.status,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },
};
