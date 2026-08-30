import { prestamoService } from "./prestamos.service.js";

export const prestamoController = {
  async getAll(req, res) {
    try {
      const prestamos = await prestamoService.getAllPrestamos();
      res.status(200).json(prestamos);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const prestamo = await prestamoService.getPrestamoById(req.params.id);
      res.status(200).json(prestamo);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const prestamo = await prestamoService.createPrestamo(req.body);
      res.status(201).json({
        message: "Préstamo creado correctamente",
        prestamoId: prestamo.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message, field: err.field });
    }
  },

  async update(req, res) {
    try {
      const prestamo = await prestamoService.updatePrestamo(req.params.id, req.body);
      res.status(200).json({
        message: "Préstamo actualizado correctamente",
        prestamoId: prestamo.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 400).json({ error: err.message, field: err.field });
    }
  },

  async returnLoan(req, res) {
    try {
      const prestamo = await prestamoService.returnPrestamo(req.params.id);
      res.status(200).json({
        message: "Préstamo marcado como devuelto",
        prestamoId: prestamo.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },
};
