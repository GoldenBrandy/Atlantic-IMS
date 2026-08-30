import { buildReportDataset } from "./buildReportDataset";
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { sileo } from "sileo";

// Generador de reportes generico: sirve para cualquier modulo (usuarios,
// materiales, productos, etc.) siempre que se le pasen los datos ya
// cargados y la config de campos ({ key, label, default, value? }).
export function generateReport({
  data,
  format,
  selectedFields,
  scope,
  filterField,
  filterValue,
  title = "Reporte",
  fileNamePrefix = "reporte",
}) {
  const { headers, rows } = buildReportDataset({
    data,
    selectedFields,
    scope,
    filterField,
    filterValue,
  });

  const timestamp = new Date().toISOString().slice(0, 10);

  if (!rows.length) {
    sileo.warning({
      title: "Sin datos",
      description: "No hay datos para generar el reporte",
    });
    return;
  }

  if (format === "excel") {
    generateExcelReport({
      headers,
      rows,
      title,
      sheetName: title,
      fileName: `${fileNamePrefix}-${timestamp}.xlsx`,
    });
  } else {
    generatePdfReport({
      headers,
      rows,
      title,
      fileName: `${fileNamePrefix}-${timestamp}.pdf`,
    });
  }

  sileo.success({
    title: "Reporte generado",
    description: `Se descargó el reporte en formato ${format === "excel" ? "Excel" : "PDF"}`,
  });
}