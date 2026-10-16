export const CATEGORIA_REPORT_FIELDS = [
  { key: "name", label: "Nombre", default: true },
  { key: "status", label: "Estado", default: true, value: (c) => (c.status === "activo" ? "Activo" : "Inactivo") },
  { key: "description", label: "Descripción", default: false },
];
