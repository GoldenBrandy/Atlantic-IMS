import { productoRepository } from "./productos.repository.js";
import { nextProductCode } from "../../utils/generateProductCode.js";

function toResponsibleId(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

// Genera el siguiente codigo secuencial (PRD-0001, PRD-0002...) consultando
// los codigos ya existentes; el cliente nunca envia ni controla este valor.
async function generateProductCode() {
  const existingCodes = await productoRepository.findCodes();
  return nextProductCode(existingCodes);
}

function mapPayload(data) {
  return {
    name: data.name,
    type: data.type,
    category: data.category,
    responsible: toResponsibleId(data.responsible),
    lastMovement: data.lastMovement,
    location: data.location,
    quantity: Number(data.quantity) || 0,
    supplier: data.supplier,
    observations: data.observations,
    imageUrl: data.imageUrl ?? null,
  };
}

export const productoService = {
  async getAllProductos() {
    return productoRepository.findAll();
  },

  async getProductoById(id) {
    const producto = await productoRepository.findById(id);
    if (!producto) throw new Error("Producto no encontrado");
    return producto;
  },

  async createProducto(data) {
    // Un producto nuevo siempre queda activo; desactivarlo se hace despues
    // desde la tabla (switch individual o deshabilitado masivo).
    const productCode = await generateProductCode();
    return productoRepository.create({ ...mapPayload(data), productCode, status: "activo" });
  },

  async updateProducto(id, data) {
    const updated = await productoRepository.update(id, mapPayload(data));
    if (!updated) throw new Error("Producto no encontrado");
    return updated;
  },

  async bulkDisable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe indicar al menos un id");
      error.statusCode = 400;
      throw error;
    }
    return productoRepository.bulkDisable(ids);
  },

  async setActive(id, isActive) {
    const updated = await productoRepository.setActive(id, isActive);
    if (!updated) throw new Error("Producto no encontrado");
    return updated;
  },
};
