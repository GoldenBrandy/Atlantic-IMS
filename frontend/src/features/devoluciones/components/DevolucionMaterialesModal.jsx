import { useState } from "react";
import { X, Check } from "lucide-react";
import { Input, Button, Select } from "@/shared";
import { CONDITION_OPTIONS } from "../services/devolucionOptionsService";

const conditionSelectOptions = [{ id: "", label: "Selecciona..." }, ...CONDITION_OPTIONS];

// Modal con la tabla de materiales del prestamo seleccionado. El padre solo
// aplica los cambios (onSave) cuando el usuario confirma, para poder
// cancelar sin perder lo que ya tenia guardado.
export default function DevolucionMaterialesModal({ materials, onClose, onSave }) {
  const [rows, setRows] = useState(materials);
  const [error, setError] = useState("");

  const updateRow = (materialId, field, value) => {
    setRows((prev) => prev.map((row) => (row.materialId === materialId ? { ...row, [field]: value } : row)));
  };

  const handleSave = () => {
    const missingCondition = rows.some((row) => !row.condition);
    if (missingCondition) {
      setError("Selecciona el estado de cada material antes de continuar");
      return;
    }
    setError("");
    onSave(rows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg text-black [&_input]:text-black [&_select]:text-black [&_span]:text-black">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">Materiales a devolver</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-neutral-50 text-caption uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nombre del material</th>
                <th className="px-4 py-3">Cantidad prestada</th>
                <th className="px-4 py-3">Cantidad devuelta</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((row) => (
                <tr key={row.materialId}>
                  <td className="px-4 py-3 font-medium">{row.materialName}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.materialQuantity}</td>
                  <td className="px-4 py-3">
                    <Input
                      dense
                      type="number"
                      min="0"
                      value={row.quantityReturned}
                      onChange={(e) => updateRow(row.materialId, "quantityReturned", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      dense
                      options={conditionSelectOptions}
                      value={row.condition}
                      onChange={(e) => updateRow(row.materialId, "condition", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="mt-2 text-caption text-red-800">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="button" onClick={handleSave} className="gap-2">
            <Check size={16} />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}