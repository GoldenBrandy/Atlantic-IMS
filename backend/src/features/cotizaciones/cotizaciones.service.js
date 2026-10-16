import { cotizacionRepository } from "./cotizaciones.repository.js";

function validateCotizacion(data, { isCreating }) {
  const fail = (message, field) => {
    const error = new Error(message);
    error.statusCode = 400;
    error.field = field;
    throw error;
  };
  if (typeof data?.name !== "string" || data.name.trim() === "") {
    fail("El nombre de la cotización es obligatorio", "name");
  }
  if (isCreating && (typeof data?.fileUrl !== "string" || data.fileUrl.trim() === "")) {
    fail("Debe adjuntar el PDF de la cotización", "fileUrl");
  }
}

export const cotizacionService = {
  async getAllCotizaciones() {
    return cotizacionRepository.findAll();
  },

  async getCotizacionById(id) {
    const cotizacion = await cotizacionRepository.findById(id);
    if (!cotizacion) throw new Error("Cotización no encontrada");
    return cotizacion;
  },

  async createCotizacion(data) {
    validateCotizacion(data, { isCreating: true });
    return cotizacionRepository.create({
      name: data.name,
      fileUrl: data.fileUrl,
      quotationDate: data.quotationDate,
    });
  },

  async updateCotizacion(id, data) {
    validateCotizacion(data, { isCreating: false });
    const updated = await cotizacionRepository.update(id, {
      name: data.name,
      fileUrl: data.fileUrl,
      quotationDate: data.quotationDate,
    });
    if (!updated) throw new Error("Cotización no encontrada");
    return updated;
  },

  async bulkDisable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe indicar al menos un id");
      error.statusCode = 400;
      throw error;
    }
    return cotizacionRepository.bulkDisable(ids);
  },

  async setActive(id, isActive) {
    const updated = await cotizacionRepository.setActive(id, isActive);
    if (!updated) throw new Error("Cotización no encontrada");
    return updated;
  },
};
