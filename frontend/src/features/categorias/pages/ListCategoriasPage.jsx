import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategoriaColumns } from "../table/categorias.column.jsx";
import { getCategorias, bulkDisableCategorias, setCategoriaActive } from "../services/categoriaService.js";
import { sileo } from "sileo";

export default function ListCategoriasPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);

  const loadCategorias = useCallback(() => {
    getCategorias()
      .then(setCategorias)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar las categorías",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableCategorias(ids);
      sileo.success({
        title: "Categorías deshabilitadas",
        description: `${ids.length} categoría(s) deshabilitada(s) correctamente`,
      });
      loadCategorias();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar las categorías",
        description: err?.message || String(err),
      });
    }
  };

  const handleToggleStatus = useCallback(async (categoria, nextValue) => {
    try {
      await setCategoriaActive(categoria.id, nextValue);
      setCategorias((prev) =>
        prev.map((item) =>
          item.id === categoria.id ? { ...item, status: nextValue ? "activo" : "inactivo" } : item,
        ),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${categoria.name} quedó ${nextValue ? "activa" : "inactiva"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const categoriaColumns = useMemo(() => getCategoriaColumns(handleToggleStatus), [handleToggleStatus]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Categorías</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/categorias/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear categoría
        </Button>
      </div>

      <DataTable
        data={categorias}
        columns={categoriaColumns}
        enableSelection
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}
