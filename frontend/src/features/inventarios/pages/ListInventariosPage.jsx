// Pagina de listado de inventarios: tabla con seleccion multiple para
// deshabilitar en lote y switch individual por fila.
import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInventarioColumns } from "../table/inventarios.column.jsx";
import { getInventarios, bulkDisableInventarios, setInventarioActive } from "../services/inventarioService.js";
import { sileo } from "sileo";

export default function ListInventariosPage() {
  const navigate = useNavigate();
  const [inventarios, setInventarios] = useState([]);

  const loadInventarios = useCallback(() => {
    getInventarios()
      .then(setInventarios)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar los inventarios",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadInventarios();
  }, [loadInventarios]);

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableInventarios(ids);
      sileo.success({
        title: "Inventarios deshabilitados",
        description: `${ids.length} inventario(s) deshabilitado(s) correctamente`,
      });
      loadInventarios();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar los inventarios",
        description: err?.message || String(err),
      });
    }
  };

  const handleToggleStatus = useCallback(async (inventario, nextValue) => {
    try {
      await setInventarioActive(inventario.id, nextValue);
      setInventarios((prev) =>
        prev.map((item) => (item.id === inventario.id ? { ...item, is_active: nextValue } : item)),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${inventario.name} quedó ${nextValue ? "activo" : "inactivo"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const inventarioColumns = useMemo(() => getInventarioColumns(handleToggleStatus), [handleToggleStatus]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Inventarios</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/inventarios/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear inventario
        </Button>
      </div>

      <DataTable
        data={inventarios}
        columns={inventarioColumns}
        enableSelection
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}
