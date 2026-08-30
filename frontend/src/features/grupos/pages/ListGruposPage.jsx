import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getGrupoColumns } from "../table/grupos.column.jsx";
import { getGrupos, bulkDisableGrupos, setGrupoActive } from "../services/grupoService.js";
import { sileo } from "sileo";

export default function ListGruposPage() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);

  const loadGrupos = useCallback(() => {
    getGrupos()
      .then(setGrupos)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar los grupos",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableGrupos(ids);
      sileo.success({
        title: "Grupos deshabilitados",
        description: `${ids.length} grupo(s) deshabilitado(s) correctamente`,
      });
      loadGrupos();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar los grupos",
        description: err?.message || String(err),
      });
    }
  };

  const handleToggleStatus = useCallback(async (grupo, nextValue) => {
    try {
      await setGrupoActive(grupo.id, nextValue);
      setGrupos((prev) =>
        prev.map((item) => (item.id === grupo.id ? { ...item, is_active: nextValue } : item)),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${grupo.group_name} quedó ${nextValue ? "activo" : "inactivo"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const grupoColumns = useMemo(() => getGrupoColumns(handleToggleStatus), [handleToggleStatus]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Grupos</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/grupos/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear grupo
        </Button>
      </div>

      <DataTable
        data={grupos}
        columns={grupoColumns}
        enableSelection
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}