// Definicion de columnas de la tabla de inventarios.
import { Switch } from "@/shared";
import InventarioRowActions from "../components/InventarioRowActions";

// onToggleStatus(inventario, nextValue) se llama cuando se cambia el switch
// de una fila individual (distinto de la deshabilitacion masiva de la tabla).
export function getInventarioColumns(onToggleStatus) {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const inventario = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={inventario.is_active}
              onChange={(value) => onToggleStatus?.(inventario, value)}
            />
            <span className={`text-caption font-medium ${inventario.is_active ? "text-green-700" : "text-neutral-400"}`}>
              {inventario.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <InventarioRowActions inventario={row.original} />,
    },
  ];
}
