import * as XLSX from "xlsx";

export function generateExcelReport({
  headers,
  rows,
  title = "Reporte",
  sheetName = "Reporte",
  fileName = "reporte.xlsx",
}) {
  const currentDate = new Date().toLocaleDateString();
  const reportTitle = `${title} - ${currentDate}`;
  const worksheetData = [[reportTitle], [], headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: range.e.c },
    },
  ];

  const workbook = XLSX.utils.book_new();
  // Excel limita el nombre de la hoja a 31 caracteres.
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, fileName);
}