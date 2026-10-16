import { Switch } from "@/shared";
import CategoriaRowActions from "../components/CategoriaRowActions";

// Genera las columnas de la tabla. onToggleStatus(categoria, nextValue) se
// llama cuando se cambia el switch de una fila individual (no masivo).
export function getCategoriaColumns(onToggleStatus) {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const categoria = row.original;
        const isActive = categoria.status === "activo";

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onChange={(value) => onToggleStatus?.(categoria, value)}
            />
            <span className={`text-caption font-medium ${isActive ? "text-green-700" : "text-neutral-400"}`}>
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      id: "actions",
      cell: ({ row }) => <CategoriaRowActions categoria={row.original} />,
    },
  ];
}
