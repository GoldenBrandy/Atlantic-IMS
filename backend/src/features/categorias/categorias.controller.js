import { categoriaService } from "./categorias.service.js";

export const categoriaController = {
  async getAll(req, res) {
    try {
      const categorias = await categoriaService.getAllCategorias();
      res.status(200).json(categorias);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const categoria = await categoriaService.getCategoriaById(req.params.id);
      res.status(200).json(categoria);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const categoria = await categoriaService.createCategoria(req.body);
      res.status(201).json({
        message: "Categoría creada correctamente",
        categoriaId: categoria.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const categoria = await categoriaService.updateCategoria(req.params.id, req.body);
      res.status(200).json({
        message: "Categoría actualizada correctamente",
        categoriaId: categoria.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  async bulkDisable(req, res) {
    try {
      const updated = await categoriaService.bulkDisable(req.body?.ids);
      res.status(200).json({
        message: "Categorías deshabilitadas correctamente",
        updated: updated.map((row) => row.id),
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async setActive(req, res) {
    try {
      const updated = await categoriaService.setActive(req.params.id, Boolean(req.body?.isActive));
      res.status(200).json({
        message: "Estado de la categoría actualizado correctamente",
        status: updated.status,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },
};
