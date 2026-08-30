import { Switch } from "@/shared";
import GrupoRowActions from "../components/GrupoRowActions";

// Genera las columnas de la tabla. onToggleStatus(grupo, nextValue) se llama
// cuando se cambia el switch de una fila individual (no masivo).
export function getGrupoColumns(onToggleStatus) {
  return [
    {
      accessorKey: "group_name",
      header: "Nombre",
    },
    {
      accessorKey: "group_code",
      header: "Código",
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const grupo = row.original;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={grupo.is_active}
              onChange={(value) => onToggleStatus?.(grupo, value)}
            />
            <span className={`text-caption font-medium ${grupo.is_active ? "text-green-700" : "text-neutral-400"}`}>
              {grupo.is_active ? "Activo" : "Inactivo"}
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
      cell: ({ row }) => <GrupoRowActions grupo={row.original} />,
    },
  ];
}