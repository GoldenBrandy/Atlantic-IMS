export const COTIZACION_REPORT_FIELDS = [
  { key: "name", label: "Nombre", default: true },
  {
    key: "quotation_date",
    label: "Fecha",
    default: true,
    value: (c) => (c.quotation_date ? String(c.quotation_date).slice(0, 10) : ""),
  },
  { key: "status", label: "Estado", default: true, value: (c) => (c.status === "activo" ? "Activo" : "Inactivo") },
];
