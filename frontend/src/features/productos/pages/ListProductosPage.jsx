import { useEffect, useMemo, useState, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProductoColumns } from "../table/productos.column.jsx";
import { getProductos, bulkDisableProductos, setProductoActive } from "../services/productoService.js";
import { getUsers } from "@/features/users/services/userService";
import { sileo } from "sileo";

export default function ListProductosPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [users, setUsers] = useState([]);

  const loadProductos = useCallback(() => {
    getProductos()
      .then(setProductos)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar los productos",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadProductos();
    getUsers().then(setUsers).catch(console.error);
  }, [loadProductos]);

  const handleToggleStatus = useCallback(async (producto, nextValue) => {
    try {
      await setProductoActive(producto.id, nextValue);
      setProductos((prev) =>
        prev.map((item) =>
          item.id === producto.id ? { ...item, status: nextValue ? "activo" : "inactivo" } : item,
        ),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${producto.name} quedó ${nextValue ? "activo" : "inactivo"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const productoColumns = useMemo(() => getProductoColumns(users, handleToggleStatus), [users, handleToggleStatus]);

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableProductos(ids);
      sileo.success({
        title: "Productos deshabilitados",
        description: `${ids.length} producto(s) deshabilitado(s) correctamente`,
      });
      loadProductos();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar los productos",
        description: err?.message || String(err),
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Productos</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/productos/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear producto
        </Button>
      </div>

      <DataTable
        data={productos}
        columns={productoColumns}
        enableSelection
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}