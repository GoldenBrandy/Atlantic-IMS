import { useEffect, useMemo, useState } from "react";
import { DataTable, Button, Select, ReportConfigModal } from "@/shared";
import { FileText } from "lucide-react";
import { getAuditLogs } from "../services/auditLogService";
import { getHistorialColumns } from "../table/historial.column.jsx";
import { HISTORIAL_REPORT_FIELDS } from "../reports/historialReportFields.js";
import { HISTORIAL_MODULE_LABELS } from "../constants.js";
import { sileo } from "sileo";

const MODULE_OPTIONS = [
  { id: "", label: "Todos los módulos" },
  ...Object.entries(HISTORIAL_MODULE_LABELS).map(([id, label]) => ({
    id,
    label,
  })),
];

export default function ListHistorialPage() {
  const [logs, setLogs] = useState([]);
  const [moduleFilter, setModuleFilter] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch((err) => {
        sileo.error({
          title: "No se pudo cargar el historial",
          description: err?.message || String(err),
        });
      });
  }, []);

  const filteredLogs = useMemo(() => {
    if (!moduleFilter) return logs;
    return logs.filter((log) => log.module === moduleFilter);
  }, [logs, moduleFilter]);

  const historialColumns = useMemo(() => getHistorialColumns(), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Historial del sistema</h1>
          <p className="text-sm text-neutral-500">
            Trazabilidad de las acciones realizadas en todos los módulos. El
            super administrador no queda registrado.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsReportModalOpen(true)}
          className="gap-2"
        >
          <FileText size={18} />
          Reporte
        </Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filtrar por módulo"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          options={MODULE_OPTIONS}
        />
      </div>

      <ReportConfigModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        data={filteredLogs}
        fields={HISTORIAL_REPORT_FIELDS}
        title="Reporte de historial"
        fileNamePrefix="historial"
        filterField={{ key: "module", label: "Módulo" }}
      />

      <DataTable
        data={filteredLogs}
        columns={historialColumns}
        variant="clean"
      />
    </div>
  );
}
