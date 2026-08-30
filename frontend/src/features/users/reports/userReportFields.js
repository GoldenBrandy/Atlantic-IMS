export const USER_REPORT_FIELDS = [
  { key: "user_name", label: "Nombre", default: true },
  { key: "user_email", label: "Correo electrónico", default: true },
  { key: "document_type", label: "Tipo de documento", default: true },
  { key: "document_number", label: "Número de documento", default: true },
  { key: "user_phone", label: "Teléfono", default: false },
  { key: "address", label: "Dirección", default: false },
  { key: "is_active", label: "Estado", default: false, value: (u) => (u.is_active ? "Activo" : "Inactivo") },
];
