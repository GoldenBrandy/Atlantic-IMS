import { PRODUCT_TYPE_OPTIONS } from "../services/productoOptionsService";

function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

export const PRODUCTO_REPORT_FIELDS = [
  { key: "name", label: "Nombre", default: true },
  { key: "product_code", label: "Código de producto", default: true },
  { key: "type", label: "Tipo", default: true, value: (p) => findLabel(PRODUCT_TYPE_OPTIONS, p.type) },
  { key: "categoria_name", label: "Categoría", default: false },
  { key: "status", label: "Estado", default: true, value: (p) => (p.status === "activo" ? "Activo" : "Inactivo") },
  { key: "last_movement", label: "Último movimiento", default: false },
  { key: "location", label: "Ubicación", default: false },
  { key: "quantity", label: "Cantidad", default: true },
  { key: "supplier", label: "Proveedor / origen", default: false },
  { key: "observations", label: "Observaciones", default: false },
];