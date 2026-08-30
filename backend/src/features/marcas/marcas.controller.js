import { marcaService } from "./marcas.service.js";

export const marcaController = {
  async getAll(req, res) {
    try {
      const marcas = await marcaService.getAllMarcas();
      res.status(200).json(marcas);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const marca = await marcaService.getMarcaById(req.params.id);
      res.status(200).json(marca);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const marca = await marcaService.createMarca(req.body);
      res.status(201).json({
        message: "Marca creada correctamente",
        marcaId: marca.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const marca = await marcaService.updateMarca(req.params.id, req.body);
      res.status(200).json({
        message: "Marca actualizada correctamente",
        marcaId: marca.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  async bulkDisable(req, res) {
    try {
      const updated = await marcaService.bulkDisable(req.body?.ids);
      res.status(200).json({
        message: "Marcas deshabilitadas correctamente",
        updated: updated.map((row) => row.id),
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async setActive(req, res) {
    try {
      const updated = await marcaService.setActive(req.params.id, Boolean(req.body?.isActive));
      res.status(200).json({
        message: "Estado de la marca actualizado correctamente",
        status: updated.status,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },
};
