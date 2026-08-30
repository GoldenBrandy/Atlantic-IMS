import { useEffect, useMemo, useState, useCallback } from "react";
import { DataTable, Button, ReportConfigModal } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMaterialColumns } from "../table/materiales.column.jsx";
import { getMateriales, bulkDisableMateriales, setMaterialActive } from "../services/materialService.js";
import { MATERIAL_TYPE_SLUGS } from "../services/materialTypeService.js";
import { MATERIAL_REPORT_FIELDS } from "../reports/materialReportFields.js";
import { sileo } from "sileo";

export default function ListMaterialPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [materiales, setMateriales] = useState([]);

  const tipo = searchParams.get("tipo");

  const loadMateriales = useCallback(() => {
    getMateriales()
      .then(setMateriales)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar los materiales",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadMateriales();
  }, [loadMateriales]);

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableMateriales(ids);
      sileo.success({
        title: "Materiales deshabilitados",
        description: `${ids.length} material(es) deshabilitado(s) correctamente`,
      });
      loadMateriales();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar los materiales",
        description: err?.message || String(err),
      });
    }
  };

  const handleToggleStatus = useCallback(async (material, nextValue) => {
    try {
      await setMaterialActive(material.id, nextValue);
      setMateriales((prev) =>
        prev.map((item) => (item.id === material.id ? { ...item, is_active: nextValue } : item)),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${material.name} quedó ${nextValue ? "activo" : "inactivo"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const materialColumns = useMemo(() => getMaterialColumns(handleToggleStatus), [handleToggleStatus]);

  const typeLabel = tipo ? (MATERIAL_TYPE_SLUGS[tipo.toLowerCase()] ?? tipo) : null;

  const filteredMateriales = useMemo(() => {
    if (!typeLabel) return materiales;
    return materiales.filter((material) => material.type.toLowerCase() === typeLabel.toLowerCase());
  }, [typeLabel, materiales]);

  const title = typeLabel ? `Materiales - ${typeLabel}` : "Materiales";
  const createUrl = tipo ? `/dashboard/materiales/crear?tipo=${tipo}` : "/dashboard/materiales/crear";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsReportModalOpen(true)}
            className="gap-2"
          >
            <Plus size={18} />
            Reporte
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(createUrl)}
            className="gap-2"
          >
            <Plus size={18} />
            Crear material
          </Button>
        </div>
      </div>

      <ReportConfigModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        data={filteredMateriales}
        fields={MATERIAL_REPORT_FIELDS}
        title="Reporte de materiales"
        fileNamePrefix="materiales"
      />

      <DataTable
        data={filteredMateriales}
        columns={materialColumns}
        enableSelection
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}
