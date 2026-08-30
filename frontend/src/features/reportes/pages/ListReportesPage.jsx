import { useState } from "react";
import { ReportConfigModal } from "@/shared";
import { FileText, Users, Package, ShoppingBag, Tag, UsersRound, ClipboardList, HandCoins, History, Loader2 } from "lucide-react";
import { sileo } from "sileo";
import { isSuperUser } from "@/features/auth";

import { getUsers } from "@/features/users/services/userService";
import { USER_REPORT_FIELDS } from "@/features/users/reports/userReportFields";
import { getMateriales } from "@/features/materiales/services/materialService";
import { MATERIAL_REPORT_FIELDS } from "@/features/materiales/reports/materialReportFields";
import { getProductos } from "@/features/productos/services/productoService";
import { PRODUCTO_REPORT_FIELDS } from "@/features/productos/reports/productoReportFields";
import { getMarcas } from "@/features/marcas/services/marcaService";
import { MARCA_REPORT_FIELDS } from "@/features/marcas/reports/marcaReportFields";
import { getGrupos } from "@/features/grupos/services/grupoService";
import { GRUPO_REPORT_FIELDS } from "@/features/grupos/reports/grupoReportFields";
import { getTareas } from "@/features/tareas/services/tareaService";
import { TAREA_REPORT_FIELDS } from "@/features/tareas/reports/tareaReportFields";
import { getPrestamos } from "@/features/prestamos/services/prestamoService";
import { PRESTAMO_REPORT_FIELDS } from "@/features/prestamos/reports/prestamoReportFields";
import { getAuditLogs } from "@/features/historial/services/auditLogService";
import { HISTORIAL_REPORT_FIELDS } from "@/features/historial/reports/historialReportFields";

const REPORT_MODULES = [
  {
    key: "usuarios",
    label: "Usuarios",
    icon: Users,
    fetch: getUsers,
    fields: USER_REPORT_FIELDS,
    title: "Reporte de usuarios",
    fileNamePrefix: "usuarios",
    filterField: { key: "document_number", label: "Número de documento" },
  },
  {
    key: "materiales",
    label: "Materiales",
    icon: Package,
    fetch: getMateriales,
    fields: MATERIAL_REPORT_FIELDS,
    title: "Reporte de materiales",
    fileNamePrefix: "materiales",
  },
  {
    key: "productos",
    label: "Productos",
    icon: ShoppingBag,
    fetch: getProductos,
    fields: PRODUCTO_REPORT_FIELDS,
    title: "Reporte de productos",
    fileNamePrefix: "productos",
  },
  {
    key: "marcas",
    label: "Marcas",
    icon: Tag,
    fetch: getMarcas,
    fields: MARCA_REPORT_FIELDS,
    title: "Reporte de marcas",
    fileNamePrefix: "marcas",
  },
  {
    key: "grupos",
    label: "Grupos",
    icon: UsersRound,
    fetch: getGrupos,
    fields: GRUPO_REPORT_FIELDS,
    title: "Reporte de grupos",
    fileNamePrefix: "grupos",
  },
  {
    key: "tareas",
    label: "Tareas",
    icon: ClipboardList,
    fetch: getTareas,
    fields: TAREA_REPORT_FIELDS,
    title: "Reporte de tareas",
    fileNamePrefix: "tareas",
  },
  {
    key: "prestamos",
    label: "Préstamos",
    icon: HandCoins,
    fetch: getPrestamos,
    fields: PRESTAMO_REPORT_FIELDS,
    title: "Reporte de préstamos",
    fileNamePrefix: "prestamos",
  },
  {
    key: "historial",
    label: "Historial",
    icon: History,
    fetch: getAuditLogs,
    fields: HISTORIAL_REPORT_FIELDS,
    title: "Reporte de historial",
    fileNamePrefix: "historial",
    filterField: { key: "module", label: "Módulo" },
    superUserOnly: true,
  },
];

export default function ListReportesPage() {
  const [activeModule, setActiveModule] = useState(null);
  const [moduleData, setModuleData] = useState([]);
  const [loadingKey, setLoadingKey] = useState(null);

  const handleSelectModule = (module) => {
    setLoadingKey(module.key);
    module
      .fetch()
      .then((data) => {
        setModuleData(Array.isArray(data) ? data : []);
        setActiveModule(module);
      })
      .catch((err) => {
        sileo.error({
          title: `No se pudieron cargar los datos de ${module.label.toLowerCase()}`,
          description: err?.message || String(err),
        });
      })
      .finally(() => setLoadingKey(null));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Reportes</h1>
        <p className="text-sm text-neutral-500">
          Genera un reporte en PDF o Excel con la información de cualquier módulo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {REPORT_MODULES.filter((module) => !module.superUserOnly || isSuperUser()).map((module) => (
          <button
            key={module.key}
            type="button"
            onClick={() => handleSelectModule(module)}
            disabled={loadingKey === module.key}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-(--primary-950) hover:bg-neutral-50 disabled:opacity-60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--primary-950)/10 text-(--primary-950)">
              {loadingKey === module.key ? <Loader2 size={18} className="animate-spin" /> : <module.icon size={18} />}
            </span>
            <span>
              <span className="block font-medium text-neutral-900">{module.label}</span>
              <span className="flex items-center gap-1 text-caption text-neutral-500">
                <FileText size={12} />
                Generar reporte
              </span>
            </span>
          </button>
        ))}
      </div>

      {activeModule && (
        <ReportConfigModal
          isOpen={Boolean(activeModule)}
          onClose={() => setActiveModule(null)}
          data={moduleData}
          fields={activeModule.fields}
          title={activeModule.title}
          fileNamePrefix={activeModule.fileNamePrefix}
          filterField={activeModule.filterField}
        />
      )}
    </div>
  );
}