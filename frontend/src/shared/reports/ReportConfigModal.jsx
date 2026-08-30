import { useState } from "react";
import { generateReport } from "./generateReport";
import { Button, Input, Select, Checkbox } from "../ui";

// Modal generico para configurar y generar un reporte (PDF/Excel) a partir
// de cualquier lista de datos ya cargada. `filterField` es opcional: si se
// pasa, habilita la opcion de "filtrar por" ese campo en el alcance.
export default function ReportConfigModal({
  isOpen,
  onClose,
  data = [],
  fields = [],
  title = "Reporte",
  fileNamePrefix = "reporte",
  filterField,
}) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [selectedFields, setSelectedFields] = useState(() => fields.filter((f) => f.default));

  if (!isOpen) return null;

  const handleFieldToggle = (field) => {
    const exists = selectedFields.some((f) => f.key === field.key);
    setSelectedFields(
      exists ? selectedFields.filter((f) => f.key !== field.key) : [...selectedFields, field],
    );
  };

  const handleGenerateReport = () => {
    if (selectedFields.length === 0) return;

    generateReport({
      data,
      format,
      selectedFields,
      scope,
      filterField: filterField?.key,
      filterValue,
      title,
      fileNamePrefix,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold">Generar {title}</h2>

        <div className="mb-4">
          <Select
            label="Formato del reporte"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: "PDF", value: "pdf" },
              { label: "Excel", value: "excel" },
            ]}
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 font-medium">Campos del reporte</p>

          <div className="grid grid-cols-2 gap-2">
            {fields.map((field) => {
              const checked = selectedFields.some((f) => f.key === field.key);
              return (
                <Checkbox
                  key={field.key}
                  id={field.key}
                  name={field.key}
                  label={field.label}
                  checked={checked}
                  onChange={() => handleFieldToggle(field)}
                />
              );
            })}
          </div>
        </div>

        {filterField && (
          <>
            <div className="mb-4">
              <Select
                label="Alcance del reporte"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                options={[
                  { label: "Todos los registros", value: "all" },
                  { label: `Filtrar por ${filterField.label.toLowerCase()}`, value: "filter" },
                ]}
              />
            </div>

            {scope === "filter" && (
              <div className="mb-4">
                <Input
                  label={filterField.label}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder={`Ingrese ${filterField.label.toLowerCase()}`}
                />
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleGenerateReport} disabled={selectedFields.length === 0}>
            Generar reporte
          </Button>
        </div>
      </div>
    </div>
  );
}