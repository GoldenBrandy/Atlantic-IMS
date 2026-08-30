import { devolucionRepository } from "./devoluciones.repository.js";
import { prestamoRepository } from "../prestamos/prestamos.repository.js";

function toId(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export const devolucionService = {
  async getAllDevoluciones() {
    return devolucionRepository.findAll();
  },

  async getDevolucionByPrestamoId(prestamoId) {
    const devolucion = await devolucionRepository.findByPrestamoId(prestamoId);
    if (!devolucion) throw new Error("Devolución no encontrada");
    return devolucion;
  },

  async createDevolucion(prestamoId, data) {
    const prestamo = await prestamoRepository.findById(prestamoId);
    if (!prestamo) {
      const error = new Error("Préstamo no encontrado");
      error.statusCode = 404;
      throw error;
    }
    if (prestamo.returned_at) {
      const error = new Error("Este préstamo ya fue devuelto");
      error.statusCode = 400;
      throw error;
    }

    const existing = await devolucionRepository.findByPrestamoId(prestamoId);
    if (existing) {
      const error = new Error("Ya existe una devolución registrada para este préstamo");
      error.statusCode = 400;
      throw error;
    }

    const materials = Array.isArray(data.materials) ? data.materials : [];
    if (materials.length === 0) {
      const error = new Error("Debe registrar el estado de al menos un material");
      error.statusCode = 400;
      error.field = "materials";
      throw error;
    }

    return devolucionRepository.create(prestamoId, {
      returnedBy: toId(data.returnedBy),
      observation: data.observation || null,
      materials: materials.map((material) => ({
        materialId: toId(material.materialId),
        quantityReturned: Number(material.quantityReturned) || 0,
        condition: material.condition,
      })),
    });
  },
};
