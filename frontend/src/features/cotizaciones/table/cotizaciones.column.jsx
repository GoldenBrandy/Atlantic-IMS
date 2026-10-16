import { Switch } from "@/shared";
import CotizacionRowActions from "../components/CotizacionRowActions";

function muted(value) {
  return value === null || value === undefined || value === "" ? <span className="text-neutral-400">-</span> : value;
}

// Genera las columnas de la tabla. onToggleStatus(cotizacion, nextValue) se
// llama cuando se cambia el switch de una fila individual (no masivo).
export function getCotizacionColumns(onToggleStatus) {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      id: "quotation_date",
      header: "Fecha",
      cell: ({ row }) => muted(row.original.quotation_date ? String(row.original.quotation_date).slice(0, 10) : null),
    },
    {
      id: "file_url",
      header: "Archivo",
      cell: ({ row }) =>
        row.original.file_url ? (
          <a href={row.original.file_url} target="_blank" rel="noreferrer" className="text-caption text-blue-600 underline">
            Ver PDF
          </a>
        ) : (
          muted(null)
        ),
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const cotizacion = row.original;
        const isActive = cotizacion.status === "activo";

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onChange={(value) => onToggleStatus?.(cotizacion, value)}
            />
            <span className={`text-caption font-medium ${isActive ? "text-green-700" : "text-neutral-400"}`}>
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <CotizacionRowActions cotizacion={row.original} />,
    },
  ];
}
