import { inventariosService } from "./inventarios.service.js";

export const inventariosController = {
  async getAll(req, res) {
    try {
      const inventarios = await inventariosService.getAllInventarios();
      res.status(200).json(inventarios);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const inventario = await inventariosService.getInventarioById(req.params.id);
      res.status(200).json(inventario);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const inventario = await inventariosService.createInventario(req.body);
      res.status(201).json({ message: "Inventario creado correctamente", inventarioId: inventario.id });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const inventario = await inventariosService.updateInventario(req.params.id, req.body);
      res.status(200).json({ message: "Inventario actualizado correctamente", inventarioId: inventario.id });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  async bulkDisable(req, res) {
    try {
      const updated = await inventariosService.bulkDisable(req.body.ids);
      res.status(200).json({ message: "Inventarios deshabilitados correctamente", updated: updated.map((row) => row.id) });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async setActive(req, res) {
    try {
      const updated = await inventariosService.setActive(req.params.id, Boolean(req.body.isActive));
      res.status(200).json({ message: "Estado actualizado correctamente", isActive: updated.is_active });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },
};