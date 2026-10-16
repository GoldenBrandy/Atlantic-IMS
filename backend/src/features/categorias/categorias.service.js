import { categoriaRepository } from "./categorias.repository.js";

export const categoriaService = {
  async getAllCategorias() {
    return categoriaRepository.findAll();
  },

  async getCategoriaById(id) {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error("Categoría no encontrada");
    return categoria;
  },

  async createCategoria(data) {
    return categoriaRepository.create({
      name: data.name,
      description: data.description,
    });
  },

  async updateCategoria(id, data) {
    const updated = await categoriaRepository.update(id, {
      name: data.name,
      description: data.description,
    });
    if (!updated) throw new Error("Categoría no encontrada");
    return updated;
  },

  async bulkDisable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe indicar al menos un id");
      error.statusCode = 400;
      throw error;
    }
    return categoriaRepository.bulkDisable(ids);
  },

  async setActive(id, isActive) {
    const updated = await categoriaRepository.setActive(id, isActive);
    if (!updated) throw new Error("Categoría no encontrada");
    return updated;
  },
};
