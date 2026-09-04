import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  ViewDetailsModal,
} from "@/shared";
import { MATERIAL_CATEGORY_OPTIONS } from "../services/materialTypeService";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 2,
});

function findCategoryLabel(id) {
  if (!id) return null;
  return MATERIAL_CATEGORY_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

export default function MaterialRowActions({ material }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();
  const isConsumo = material.type === "Consumo";
  const isDevolutivo = material.type === "Devolutivo";
  const showExtendedFields = isConsumo || isDevolutivo;
  const custodianName = [material.custodian_name, material.custodian_last_name].filter(Boolean).join(" ");

  const handleEdit = () => {
    navigate(`/dashboard/materiales/${material.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar material", material.id);
  };

  const iconButtonClasses =
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        aria-label="Ver material"
        onClick={() => setIsViewOpen(true)}
        className={iconButtonClasses}
      >
        <Eye size={18} />
      </button>

      <button
        type="button"
        aria-label="Editar material"
        onClick={handleEdit}
        className={iconButtonClasses}
      >
        <Pencil size={18} />
      </button>

      <Dropdown>
        <DropdownTrigger>
          <button
            type="button"
            aria-label="Acciones de material"
            className={iconButtonClasses}
          >
            <EllipsisVertical size={18} />
          </button>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem onClick={handleEdit}>Editar</DropdownItem>
          <DropdownItem onClick={handleDelete}>Eliminar</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <ViewDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={material.name}
        fields={[
          {
            label: "Foto(s)",
            value: material.image_urls?.length ? (
              <div className="flex gap-2">
                {material.image_urls.map((url, index) => (
                  <img key={index} src={url} alt={`Foto ${index + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            ) : null,
          },
          { label: "Nombre", value: material.name },
          { label: "Tipo", value: material.type },
          { label: "Cantidad", value: material.quantity },
          { label: "Descripción", value: material.description },
          {
            label: "Estado",
            value: material.is_active ? "Activo" : "Inactivo",
          },
          ...(showExtendedFields
            ? [
                {
                  label: "Ficha(s) técnica(s)",
                  value: material.technical_sheet_urls?.length ? (
                    <div className="flex gap-2">
                      {material.technical_sheet_urls.map((url, index) => (
                        <img key={index} src={url} alt={`Ficha técnica ${index + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  ) : null,
                },
                {
                  label: "Cotizaciones",
                  value: material.quotations?.length ? (
                    <div className="flex flex-col gap-1">
                      {material.quotations.map((quotation, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                          <a href={quotation.url} target="_blank" rel="noreferrer" className="text-caption text-blue-600 underline">
                            Ver cotización {index + 1}
                          </a>
                          {quotation.value != null && (
                            <span className="text-caption text-neutral-600">{currencyFormatter.format(quotation.value)}</span>
                          )}
                          {quotation.date && <span className="text-caption text-neutral-600">{quotation.date}</span>}
                        </div>
                      ))}
                    </div>
                  ) : null,
                },
                { label: "Placa SENA", value: material.sena_plate },
                { label: "Marca", value: material.marca_name },
                { label: "Inventario", value: material.inventario_name },
                { label: "Ubicación", value: material.location },
                { label: "Fecha compra", value: material.purchase_date ? String(material.purchase_date).slice(0, 10) : null },
                { label: "Valor unitario", value: material.unit_value ? currencyFormatter.format(material.unit_value) : null },
                { label: "Valor Total", value: material.total_value ? currencyFormatter.format(material.total_value) : null },
              ]
            : []),
          ...(isConsumo ? [{ label: "Cuentadante", value: custodianName || null }] : []),
          ...(isDevolutivo
            ? [
                { label: "Modelo", value: material.model },
                { label: "Categoría", value: findCategoryLabel(material.category) },
                { label: "ID", value: material.external_id },
              ]
            : []),
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}