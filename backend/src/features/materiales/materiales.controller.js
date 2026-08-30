import { materialService } from "./materiales.service.js";

export const materialController = {
  async getAll(req, res) {
    try {
      const materiales = await materialService.getAllMateriales();
      res.status(200).json(materiales);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const material = await materialService.getMaterialById(req.params.id);
      res.status(200).json(material);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const material = await materialService.createMaterial(req.body);
      res.status(201).json({
        message: "Material creado correctamente",
        materialId: material.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const material = await materialService.updateMaterial(req.params.id, req.body);
      res.status(200).json({
        message: "Material actualizado correctamente",
        materialId: material.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  async bulkDisable(req, res) {
    try {
      const updated = await materialService.bulkDisable(req.body?.ids);
      res.status(200).json({
        message: "Materiales deshabilitados correctamente",
        updated: updated.map((row) => row.id),
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async setActive(req, res) {
    try {
      const updated = await materialService.setActive(req.params.id, Boolean(req.body?.isActive));
      res.status(200).json({
        message: "Estado del material actualizado correctamente",
        isActive: updated.is_active,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },
};
