import { Switch } from "@/shared";
import MarcaRowActions from "../components/MarcaRowActions";

// Genera las columnas de la tabla. onToggleStatus(marca, nextValue) se llama
// cuando se cambia el switch de una fila individual (no masivo).
export function getMarcaColumns(onToggleStatus) {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const marca = row.original;
        const isActive = marca.status === "activo";

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onChange={(value) => onToggleStatus?.(marca, value)}
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
      cell: ({ row }) => <MarcaRowActions marca={row.original} />,
    },
  ];
}