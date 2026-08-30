import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMarcaColumns } from "../table/marcas.column.jsx";
import { getMarcas, bulkDisableMarcas, setMarcaActive } from "../services/marcaService.js";
import { sileo } from "sileo";

export default function ListMarcasPage() {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState([]);

  const loadMarcas = useCallback(() => {
    getMarcas()
      .then(setMarcas)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar las marcas",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadMarcas();
  }, [loadMarcas]);

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableMarcas(ids);
      sileo.success({
        title: "Marcas deshabilitadas",
        description: `${ids.length} marca(s) deshabilitada(s) correctamente`,
      });
      loadMarcas();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar las marcas",
        description: err?.message || String(err),
      });
    }
  };

  const handleToggleStatus = useCallback(async (marca, nextValue) => {
    try {
      await setMarcaActive(marca.id, nextValue);
      setMarcas((prev) =>
        prev.map((item) =>
          item.id === marca.id ? { ...item, status: nextValue ? "activo" : "inactivo" } : item,
        ),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${marca.name} quedó ${nextValue ? "activa" : "inactiva"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const marcaColumns = useMemo(() => getMarcaColumns(handleToggleStatus), [handleToggleStatus]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Marcas</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/marcas/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear marca
        </Button>
      </div>

      <DataTable
        data={marcas}
        columns={marcaColumns}
        enableSelection
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}