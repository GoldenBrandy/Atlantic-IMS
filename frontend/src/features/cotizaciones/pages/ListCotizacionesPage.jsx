import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCotizacionColumns } from "../table/cotizaciones.column.jsx";
import { getCotizaciones, bulkDisableCotizaciones, setCotizacionActive } from "../services/cotizacionService.js";
import { sileo } from "sileo";

export default function ListCotizacionesPage() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);

  const loadCotizaciones = useCallback(() => {
    getCotizaciones()
      .then(setCotizaciones)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar las cotizaciones",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadCotizaciones();
  }, [loadCotizaciones]);

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableCotizaciones(ids);
      sileo.success({
        title: "Cotizaciones deshabilitadas",
        description: `${ids.length} cotización(es) deshabilitada(s) correctamente`,
      });
      loadCotizaciones();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar las cotizaciones",
        description: err?.message || String(err),
      });
    }
  };

  const handleToggleStatus = useCallback(async (cotizacion, nextValue) => {
    try {
      await setCotizacionActive(cotizacion.id, nextValue);
      setCotizaciones((prev) =>
        prev.map((item) =>
          item.id === cotizacion.id ? { ...item, status: nextValue ? "activo" : "inactivo" } : item,
        ),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${cotizacion.name} quedó ${nextValue ? "activa" : "inactiva"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const cotizacionColumns = useMemo(() => getCotizacionColumns(handleToggleStatus), [handleToggleStatus]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Cotizaciones</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/cotizaciones/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear cotización
        </Button>
      </div>

      <DataTable
        data={cotizaciones}
        columns={cotizacionColumns}
        enableSelection
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}
