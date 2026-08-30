// Arma las filas/encabezados de un reporte a partir de cualquier lista de
// datos ya cargada (usuarios, materiales, etc.) y los campos seleccionados.
// field.value(item) permite formatear/derivar el valor (ej. booleano -> "Activo").
export function buildReportDataset({ data, selectedFields, scope, filterField, filterValue }) {
  let filtered = [...data];

  if (scope === "filter" && filterField && filterValue) {
    filtered = filtered.filter((item) =>
      String(item[filterField] ?? "").toLowerCase().includes(filterValue.toLowerCase()),
    );
  }

  const headers = selectedFields.map((field) => field.label);

  const rows = filtered.map((item) =>
    selectedFields.map((field) => {
      const value = typeof field.value === "function" ? field.value(item) : item[field.key];
      return value ?? "";
    }),
  );

  return { headers, rows };
}