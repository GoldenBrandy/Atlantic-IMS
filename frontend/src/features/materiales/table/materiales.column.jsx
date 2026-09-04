import { Switch } from "@/shared";
import MaterialRowActions from "../components/MaterialRowActions";
import { MATERIAL_CATEGORY_OPTIONS } from "../services/materialTypeService";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 2,
});

function findCategoryLabel(id) {
  if (!id) return "-";
  return MATERIAL_CATEGORY_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

function muted(value) {
  return value === null || value === undefined || value === "" ? <span className="text-neutral-400">-</span> : value;
}

// Genera las columnas de la tabla. onToggleStatus(material, nextValue) se
// llama cuando se cambia el switch de una fila individual (no masivo).
export function getMaterialColumns(onToggleStatus) {
  return [
    {
      accessorKey: "id",
      header: "Id",
    },
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "type",
      header: "Tipo",
    },
    {
      id: "category",
      header: "Categoría",
      cell: ({ row }) => findCategoryLabel(row.original.category),
    },
    {
      id: "model",
      header: "Modelo",
      cell: ({ row }) => muted(row.original.model),
    },
    {
      id: "sena_plate",
      header: "Placa SENA",
      cell: ({ row }) => muted(row.original.sena_plate),
    },
    {
      id: "external_id",
      header: "ID",
      cell: ({ row }) => muted(row.original.external_id),
    },
    {
      id: "marca",
      header: "Marca",
      cell: ({ row }) => muted(row.original.marca_name),
    },
    {
      id: "inventario",
      header: "Inventario",
      cell: ({ row }) => muted(row.original.inventario_name),
    },
    {
      id: "custodian",
      header: "Cuentadante",
      cell: ({ row }) => {
        const material = row.original;
        const name = [material.custodian_name, material.custodian_last_name].filter(Boolean).join(" ");
        return muted(name || null);
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
    },
    {
      id: "location",
      header: "Ubicación",
      cell: ({ row }) => muted(row.original.location),
    },
    {
      id: "purchase_date",
      header: "Fecha compra",
      cell: ({ row }) => muted(row.original.purchase_date ? String(row.original.purchase_date).slice(0, 10) : null),
    },
    {
      id: "unit_value",
      header: "Valor unitario",
      cell: ({ row }) => muted(row.original.unit_value ? currencyFormatter.format(row.original.unit_value) : null),
    },
    {
      id: "total_value",
      header: "Valor Total",
      cell: ({ row }) => muted(row.original.total_value ? currencyFormatter.format(row.original.total_value) : null),
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const material = row.original;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={material.is_active}
              onChange={(value) => onToggleStatus?.(material, value)}
            />
            <span className={`text-caption font-medium ${material.is_active ? "text-green-700" : "text-neutral-400"}`}>
              {material.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <MaterialRowActions material={row.original} />,
    },
  ];
}