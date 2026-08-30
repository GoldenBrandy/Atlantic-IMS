export const GRUPO_REPORT_FIELDS = [
  { key: "group_name", label: "Nombre", default: true },
  { key: "group_code", label: "Código", default: true },
  { key: "is_active", label: "Estado", default: true, value: (g) => (g.is_active ? "Activo" : "Inactivo") },
  { key: "description", label: "Descripción", default: false },
];