export const INVENTARIO_REPORT_FIELDS = [
  { key: "name", label: "Nombre", default: true },
  { key: "is_active", label: "Estado", default: true, value: (i) => (i.is_active ? "Activo" : "Inactivo") },
];
