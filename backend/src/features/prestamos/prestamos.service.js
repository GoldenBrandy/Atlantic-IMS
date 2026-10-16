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
    requesterEmail: data.requesterEmail || null,
    justification: data.justification,
    loanType: data.loanType,
    startDate: data.startDate,
    dueDate: data.dueDate,
    signatureUrl: data.signatureUrl ?? null,
    requesterIdentityConfirmed: Boolean(data.requesterIdentityConfirmed),
    lenderIdentityConfirmed: Boolean(data.lenderIdentityConfirmed),
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
    // La firma ya no es obligatoria al crear: la persona puede firmar despues
    // editando el prestamo desde su propia cuenta, sin tener que estar
    // presente en el momento de la creacion.
    if (!Array.isArray(data.materialIds) || data.materialIds.length === 0) {
      const error = new Error("Debe seleccionar al menos un ítem a prestar");
      error.statusCode = 400;
      error.field = "materialIds";
      throw error;
    }
    if (!data.requestingUser && !data.requesterEmail) {
      const error = new Error("Debe seleccionar un usuario solicitante registrado o indicar su correo electrónico");
      error.statusCode = 400;
      error.field = "requesterEmail";
      throw error;
    }
    if (!data.requesterIdentityConfirmed){
      const error = new Error("Debe confirmarse la identidad del usuario solicitante");
      error.statusCode = 400;
      error.field = "requesterIdentityConfirmed";
      throw error;
    }
    if (!data.lenderIdentityConfirmed){
      const error = new Error("Debe confirmarse la identidad del usuario prestador");
      error.statusCode = 400;
      error.field = "lenderIdentityConfirmed";
      throw error;
    }

    // Los items deben existir y estar disponibles (activos y con existencias).
    const ids = [...new Set(data.materialIds.map(toId).filter((id) => id !== null))];
    const found = await prestamoRepository.findMaterialsByIds(ids);
    if (found.length !== ids.length) {
      const error = new Error("Uno o mas items seleccionados no existen");
      error.statusCode = 400;
      error.field = "materialIds";
      throw error;
    }
    const unavailable = found.find((m) => !m.is_active || Number(m.quantity) <= 0);
    if (unavailable) {
      const error = new Error(
        `El item "${unavailable.name}" no esta disponible (deshabilitado o sin existencias)`,
      );
      error.statusCode = 409;
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
