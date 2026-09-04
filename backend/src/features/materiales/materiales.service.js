import { materialRepository } from "./materiales.repository.js";

function toId(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

// Los "valores" (unitario/total) aplican a consumo y devolutivo. El valor
// total siempre se recalcula en el backend (cantidad x unitario) para que
// nunca quede inconsistente sin importar lo que mande el cliente.
function mapPayload(data) {
  const quantity = Number(data.quantity) || 0;
  const unitValue =
    data.unitValue !== undefined && data.unitValue !== ""
      ? Number(data.unitValue)
      : null;
  const totalValue =
    unitValue !== null ? Number((quantity * unitValue).toFixed(2)) : null;

  return {
    name: data.name,
    type: data.type,
    quantity,
    description: data.description,
    isActive: data.isActive ?? true,
    imageUrls: Array.isArray(data.imageUrls)
      ? data.imageUrls.filter(Boolean)
      : [],
    technicalSheetUrls: Array.isArray(data.technicalSheetUrls)
      ? data.technicalSheetUrls.filter(Boolean)
      : [],
    quotations: Array.isArray(data.quotations)
      ? data.quotations
          .filter((q) => q?.url)
          .map((q) => ({
            url: q.url,
            value:
              q.value !== undefined && q.value !== "" ? Number(q.value) : null,
            date: q.date || null,
          }))
      : [],
    senaPlate: data.senaPlate ?? null,
    marcaId: toId(data.marcaId ?? data.marca),
    custodianId: toId(data.custodianId ?? data.custodian),
    inventarioId: toId(data.inventarioId ?? data.inventario),
    location: data.location ?? null,
    purchaseDate: data.purchaseDate || null,
    unitValue,
    totalValue,
    model: data.model ?? null,
    category: data.category ?? null,
    externalId: data.externalId ?? null,
  };
}

export const materialService = {
  async getAllMateriales() {
    return materialRepository.findAll();
  },

  async getMaterialById(id) {
    const material = await materialRepository.findById(id);
    if (!material) throw new Error("Material no encontrado");
    return material;
  },

  async createMaterial(data) {
    return materialRepository.create(mapPayload(data));
  },

  async updateMaterial(id, data) {
    const updated = await materialRepository.update(id, mapPayload(data));
    if (!updated) throw new Error("Material no encontrado");
    return updated;
  },

  async bulkDisable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe indicar al menos un id");
      error.statusCode = 400;
      throw error;
    }
    return materialRepository.bulkDisable(ids);
  },

  async setActive(id, isActive) {
    const updated = await materialRepository.setActive(id, isActive);
    if (!updated) throw new Error("Material no encontrado");
    return updated;
  },
};
