import { marcaRepository } from "./marcas.repository.js";

export const marcaService = {
  async getAllMarcas() {
    return marcaRepository.findAll();
  },

  async getMarcaById(id) {
    const marca = await marcaRepository.findById(id);
    if (!marca) throw new Error("Marca no encontrada");
    return marca;
  },

  async createMarca(data) {
    return marcaRepository.create({
      name: data.name,
      description: data.description,
    });
  },

  async updateMarca(id, data) {
    const updated = await marcaRepository.update(id, {
      name: data.name,
      description: data.description,
    });
    if (!updated) throw new Error("Marca no encontrada");
    return updated;
  },

  async bulkDisable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe indicar al menos un id");
      error.statusCode = 400;
      throw error;
    }
    return marcaRepository.bulkDisable(ids);
  },

  async setActive(id, isActive) {
    const updated = await marcaRepository.setActive(id, isActive);
    if (!updated) throw new Error("Marca no encontrada");
    return updated;
  },
};
