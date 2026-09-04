import { inventariosRepository } from "./inventarios.repository.js";

export const inventariosService = {
  async getAllInventarios() {
    return inventariosRepository.getAll();
  },

  async getInventarioById(id) {
    const inventario = await inventariosRepository.getById(id);
    if (!inventario) throw new Error("Inventario no encontrado");
    return inventario;
  },

  async createInventario(data) {
    return inventariosRepository.create(data);
  },

  async updateInventario(id, data) {
    const updated = await inventariosRepository.update(id, data);
    if (!updated) throw new Error("Inventario no encontrado");
    return updated;
  },

  async bulkDisable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe indicar al menos un id");
      error.statusCode = 400;
      throw error;
    }
    return inventariosRepository.bulkDisable(ids);
  },

  async setActive(id, isActive) {
    const updated = await inventariosRepository.setActive(id, isActive);
    if (!updated) throw new Error("Inventario no encontrado");
    return updated;
  },
};