export const MARCA_REPORT_FIELDS = [
  { key: "name", label: "Nombre", default: true },
  { key: "status", label: "Estado", default: true, value: (m) => (m.status === "activo" ? "Activo" : "Inactivo") },
  { key: "description", label: "Descripción", default: false },
];