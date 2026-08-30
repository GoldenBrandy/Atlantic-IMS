import { prestamoRepository } from "./prestamos.repository.js";

function toId(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapPayload(data) {
  const materialIds = Array.isArray(data.materialIds) ? data.materialIds : [];
  return {
    materialIds: materialIds.map(toId).filter((id) => id !== null),
    requestingUser: toId(data.requestingUser),
    lendingUser: toId(data.lendingUser),
    ficha: data.ficha || null,
    justification: data.justification,
    loanType: data.loanType,
    startDate: data.startDate,
    dueDate: data.dueDate,
    signatureUrl: data.signatureUrl ?? null,
  };
}

export const prestamoService = {
  async getAllPrestamos() {
    return prestamoRepository.findAll();
  },

  async getPrestamoById(id) {
    const prestamo = await prestamoRepository.findById(id);
    if (!prestamo) throw new Error("Préstamo no encontrado");
    return prestamo;
  },

  async createPrestamo(data) {
    if (!data.signatureUrl) {
      const error = new Error("Debe adjuntar la firma digital para legalizar el préstamo");
      error.statusCode = 400;
      error.field = "signatureUrl";
      throw error;
    }
    if (!Array.isArray(data.materialIds) || data.materialIds.length === 0) {
      const error = new Error("Debe seleccionar al menos un ítem a prestar");
      error.statusCode = 400;
      error.field = "materialIds";
      throw error;
    }
    return prestamoRepository.create(mapPayload(data));
  },

  async updatePrestamo(id, data) {
    const updated = await prestamoRepository.update(id, mapPayload(data));
    if (!updated) throw new Error("Préstamo no encontrado");
    return updated;
  },

  async returnPrestamo(id) {
    const updated = await prestamoRepository.markReturned(id);
    if (!updated) throw new Error("Préstamo no encontrado");
    return updated;
  },
};
